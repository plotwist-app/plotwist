import type { FastifyRedis } from '@fastify/redis'
import type { StatsPeriod } from '@/infra/http/schemas/common'
import { selectAllUserItemsByStatus } from '@/infra/db/repositories/user-item-repository'
import { getTMDBCredits } from '../tmdb/get-tmdb-credits'
import { processInBatches } from './batch-utils'
import { getCachedStats, getUserStatsCacheKey } from './cache-utils'

type GetUserWatchedCastServiceInput = {
  userId: string
  redis: FastifyRedis
  dateRange?: { startDate: Date | undefined; endDate: Date | undefined }
  period?: StatsPeriod
}

export async function getUserWatchedCastService({
  userId,
  redis,
  dateRange,
  period = 'all',
}: GetUserWatchedCastServiceInput) {
  const cacheKey = getUserStatsCacheKey(userId, 'watched-cast', undefined, period)

  return getCachedStats(redis, cacheKey, async () => {
    const watchedItems = await selectAllUserItemsByStatus({
      status: 'WATCHED',
      userId,
      startDate: dateRange?.startDate,
      endDate: dateRange?.endDate,
    })

    const watchedItemsCast = await processInBatches(
      watchedItems,
      async ({ tmdbId, mediaType }) => {
        const variant = mediaType === 'TV_SHOW' ? 'tv' : 'movie'
        const { cast } = await getTMDBCredits(redis, [variant, tmdbId, 'en-US'])

        return cast
      }
    )

    const flattedCast = watchedItemsCast.flat()
    const filteredCast = flattedCast.filter(
      actor =>
        actor.known_for_department === 'Acting' &&
        ['(', ')'].every(char => !actor.character.includes(char))
    )

    const totalWatchedItems = watchedItems.length

    const actorCount: Record<
      number,
      { name: string; count: number; profilePath: string | null }
    > = {}

    for (const actor of filteredCast) {
      const actorId = actor.id

      if (!actorCount[actorId]) {
        actorCount[actorId] = {
          name: actor.name,
          count: 1,
          profilePath: actor.profile_path || null,
        }
      } else {
        actorCount[actorId].count += 1
      }
    }

    const sortedActors = Object.entries(actorCount)
      .map(([id, actor]) => ({
        id: id,
        name: actor.name,
        count: actor.count,
        percentage: (actor.count / totalWatchedItems) * 100,
        profilePath: actor.profilePath,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return { watchedCast: sortedActors }
  })
}
