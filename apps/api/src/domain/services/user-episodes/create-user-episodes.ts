import { insertUserEpisodes } from '@/db/repositories/user-episode'
import type { InsertUserEpisode } from '@/domain/entities/user-episode'

export async function createUserEpisodesService(values: InsertUserEpisode[]) {
  const userEpisodes = await insertUserEpisodes(values)
  return { userEpisodes }
}
