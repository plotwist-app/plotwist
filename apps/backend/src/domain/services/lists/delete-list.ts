import { deleteList } from '@/db/repositories/list-repository'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'

type DeleteListInput = { id: string; userId: string }

const deleteListServiceImpl = async ({ id }: DeleteListInput) => {
  const [deletedList] = await deleteList(id)

  return deletedList
}

export const deleteListService = withServiceTracing(
  'delete-list',
  deleteListServiceImpl
)
