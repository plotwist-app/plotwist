import type { FastifyRedis } from '@fastify/redis'
import { selectAllUserItemsByStatus } from '@/db/repositories/user-item-repository'
import { getTMDBCredits } from '../tmdb/get-tmdb-credits'

type GetUserWatchedCastServiceInput = {
  userId: string
  redis: FastifyRedis
}

export async function getUserWatchedCastService({
  userId,
  redis,
}: GetUserWatchedCastServiceInput) {
  const watchedItems = await selectAllUserItemsByStatus({
    status: 'WATCHED',
    userId,
  })

  const watchedItemsCast = await Promise.all(
    watchedItems.map(async ({ tmdbId, mediaType }) => {
      const variant = mediaType === 'TV_SHOW' ? 'tv' : 'movie'
      const { cast } = await getTMDBCredits(redis, [variant, tmdbId, 'en-US'])

      return cast
    })
  )

  const flattedCast = watchedItemsCast.flat()
  const filteredCast = flattedCast.filter(
    actor =>
      actor.known_for_department === 'Acting' &&
      // Filter characters that are voiced
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
}
