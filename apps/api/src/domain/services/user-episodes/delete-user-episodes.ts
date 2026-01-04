import { deleteUserEpisodes } from '@/db/repositories/user-episode'

export async function deleteUserEpisodesService(ids: string[]) {
  return await deleteUserEpisodes(ids)
}
