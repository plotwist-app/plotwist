import { UserItemNotFoundError } from '@/domain/errors/user-item-not-found-error'
import { deleteUserItem } from '@/infra/db/repositories/user-item-repository'
import { deleteUserItemEpisodesService } from './delete-user-item-episodes'

export async function deleteUserItemService(id: string) {
  const [deletedUserItem] = await deleteUserItem(id)

  if (!deletedUserItem) {
    return new UserItemNotFoundError()
  }

  await deleteUserItemEpisodesService({
    tmdbId: deletedUserItem.tmdbId,
    userId: deletedUserItem.userId,
  })

  return { deletedUserItem }
}
