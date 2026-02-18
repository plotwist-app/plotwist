import { deleteListItem } from '@/db/repositories/list-item-repository'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'
import { ListItemNotFoundError } from '@/domain/errors/list-item-not-found-error'

type DeleteListItemInput = { id: string; userId: string }

const deleteListItemServiceImpl = async ({
  id,
  userId: _userId,
}: DeleteListItemInput) => {
  const [deletedListItem] = await deleteListItem(id)

  if (!deletedListItem) {
    return new ListItemNotFoundError()
  }

  return { deletedListItem }
}

export const deleteListItemService = withServiceTracing(
  'delete-list-item',
  deleteListItemServiceImpl
)
