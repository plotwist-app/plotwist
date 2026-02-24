import { deleteUserEpisodes } from '@/infra/db/repositories/user-episode'
import { getUserEpisodesService } from '../user-episodes/get-user-episodes'

type DeleteUserItemEpisodesService = {
  tmdbId: number
  userId: string
}

export async function deleteUserItemEpisodesService({
  tmdbId,
  userId,
}: DeleteUserItemEpisodesService) {
  const { userEpisodes } = await getUserEpisodesService({
    userId,
    tmdbId,
  })

  const userEpisodesIds = userEpisodes.map(ep => ep.id)

  await deleteUserEpisodes(userEpisodesIds)
}
