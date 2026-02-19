import type { FastifyRedis } from '@fastify/redis'
import type { Language, SeasonDetails } from '@plotwist_app/tmdb'
import { tmdb } from '@/infra/adapters/tmdb'

type GetTMDBEpisodesServiceInput = {
  tmdbId: number
  seasonNumber: number
  language: Language
}

type Season = Omit<SeasonDetails, 'episodes'> & {
  episodes: Array<
    Pick<
      SeasonDetails['episodes'][number],
      'name' | 'id' | 'season_number' | 'episode_number' | 'runtime'
    >
  >
}

const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60

export async function getTMDBEpisodesService(
  redis: FastifyRedis,
  { tmdbId, seasonNumber, language }: GetTMDBEpisodesServiceInput
) {
  const cacheKey = `season:${tmdbId}:${seasonNumber}:${language}`
  const cachedResult = await redis.get(cacheKey)

  if (cachedResult) {
    const season = JSON.parse(cachedResult) as Season

    return { episodes: season.episodes }
  }

  const seasonDetails = await tmdb.season.details(
    tmdbId,
    seasonNumber,
    language
  )

  const season: Season = {
    ...seasonDetails,
    episodes: seasonDetails.episodes.map(
      ({ name, id, season_number, episode_number, runtime }) => ({
        name,
        id,
        season_number,
        episode_number,
        runtime,
      })
    ),
  }

  await redis.set(
    cacheKey,
    JSON.stringify(season),
    'EX',
    THIRTY_DAYS_IN_SECONDS
  )

  return {
    episodes: season.episodes,
  }
}
