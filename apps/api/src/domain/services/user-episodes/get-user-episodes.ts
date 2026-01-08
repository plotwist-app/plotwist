import { selectUserEpisodes } from '@/db/repositories/user-episode'

export type GetUserEpisodesInput = { userId: string; tmdbId?: number }

export async function getUserEpisodesService({
  userId,
  tmdbId,
}: GetUserEpisodesInput) {
  const userEpisodes = await selectUserEpisodes({ userId, tmdbId })
  return { userEpisodes }
}
