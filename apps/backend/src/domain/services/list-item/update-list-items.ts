import { updateListItems } from '@/db/repositories/list-item-repository'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'

export type UpdateListItemsServiceInput = {
  listItems: Array<{ id: string; position: number }>
}

const updateListItemsServiceImpl = async (
  input: UpdateListItemsServiceInput
) => {
  const result = await updateListItems(input)
  const listItems = result.flat()

  return { listItems }
}

export const updateListItemsService = withServiceTracing(
  'update-list-items',
  updateListItemsServiceImpl
)
