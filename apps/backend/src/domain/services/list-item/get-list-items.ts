import { selectListItems } from '@/db/repositories/list-item-repository'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'
import { getListById } from '@/db/repositories/list-repository'
import { ListNotFoundError } from '../../errors/list-not-found-error'

type GetListItemsInput = { listId: string }

const getListItemsServiceImpl = async ({ listId }: GetListItemsInput) => {
  const [list] = await getListById(listId)

  if (!list) {
    return new ListNotFoundError()
  }

  const listItems = await selectListItems(listId)

  return { listItems }
}

export const getListItemsService = withServiceTracing(
  'get-list-items',
  getListItemsServiceImpl
)
