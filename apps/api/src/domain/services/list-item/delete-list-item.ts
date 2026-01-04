import { deleteListItem } from '@/db/repositories/list-item-repository'
import { ListItemNotFoundError } from '@/domain/errors/list-item-not-found-error'

type DeleteListItemInput = { id: string; userId: string }

export async function deleteListItemService({
  id,
  userId,
}: DeleteListItemInput) {
  const [deletedListItem] = await deleteListItem(id)

  if (!deletedListItem) {
    return new ListItemNotFoundError()
  }

  return { deletedListItem }
}
