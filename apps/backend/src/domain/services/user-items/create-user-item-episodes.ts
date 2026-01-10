import type { FastifyRedis } from '@fastify/redis'
import { getTMDBEpisodesService } from '../tmdb/get-tmdb-episodes'
import { getTMDBTvSeriesService } from '../tmdb/get-tmdb-tv-series'
import { createUserEpisodesService } from '../user-episodes/create-user-episodes'

const DEFAULT_LANGUAGE = 'en-US'

type CreateUserItemEpisodesService = {
  redis: FastifyRedis
  tmdbId: number
  userId: string
}

export async function createUserItemEpisodesService({
  redis,
  tmdbId,
  userId,
}: CreateUserItemEpisodesService) {
  const { seasons } = await getTMDBTvSeriesService(redis, {
    tmdbId,
    language: DEFAULT_LANGUAGE,
    returnSeasons: true,
  })

  if (seasons) {
    const filteredSeasons = seasons.filter(
      season =>
        season.season_number !== 0 && // Some TV series have special episodes and we don't consider that as part.
        season.episode_count > 0 &&
        season.vote_average > 0
    )

    const seasonEpisodes = await Promise.all(
      filteredSeasons.map(async season => {
        const { episodes } = await getTMDBEpisodesService(redis, {
          tmdbId,
          seasonNumber: season.season_number,
          language: DEFAULT_LANGUAGE,
        })

        return episodes
      })
    )

    const allEpisodesBody = seasonEpisodes
      .flat()
      .filter(ep => ep.runtime)
      .map(ep => ({
        tmdbId,
        userId,
        episodeNumber: ep.episode_number,
        seasonNumber: ep.season_number,
        runtime: ep.runtime,
      }))

    return await createUserEpisodesService(allEpisodesBody)
  }
}
