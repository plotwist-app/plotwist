import { ListItemNotFoundError } from '@/domain/errors/list-item-not-found-error'
import { deleteListItem } from '@/infra/db/repositories/list-item-repository'

type DeleteListItemInput = { id: string; userId: string }

export async function deleteListItemService({
  id,
  userId: _userId,
}: DeleteListItemInput) {
  const [deletedListItem] = await deleteListItem(id)

  if (!deletedListItem) {
    return new ListItemNotFoundError()
  }

  return { deletedListItem }
}
