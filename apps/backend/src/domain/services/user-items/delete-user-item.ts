import { deleteUserItem } from '@/db/repositories/user-item-repository'
import { UserItemNotFoundError } from '@/domain/errors/user-item-not-found-error'
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
