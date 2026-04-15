import type { InsertUserEpisode } from '@/domain/entities/user-episode'
import { insertUserEpisodes } from '@/infra/db/repositories/user-episode'

export async function createUserEpisodesService(values: InsertUserEpisode[]) {
  const userEpisodes = await insertUserEpisodes(values)
  return { userEpisodes }
}
