import { deleteUserEpisodes } from '@/infra/db/repositories/user-episode'

export async function deleteUserEpisodesService(ids: string[]) {
  return await deleteUserEpisodes(ids)
}
