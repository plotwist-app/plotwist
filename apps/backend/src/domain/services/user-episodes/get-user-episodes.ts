import { selectUserEpisodes } from '@/infra/db/repositories/user-episode'

export type GetUserEpisodesInput = {
  userId: string
  tmdbId?: number
  startDate?: Date
  endDate?: Date
}

export async function getUserEpisodesService({
  userId,
  tmdbId,
  startDate,
  endDate,
}: GetUserEpisodesInput) {
  const userEpisodes = await selectUserEpisodes({
    userId,
    tmdbId,
    startDate,
    endDate,
  })
  return { userEpisodes }
}
