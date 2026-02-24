import { updateListItems } from '@/infra/db/repositories/list-item-repository'

export type UpdateListItemsServiceInput = {
  listItems: Array<{ id: string; position: number }>
}

export async function updateListItemsService(
  input: UpdateListItemsServiceInput
) {
  const result = await updateListItems(input)
  const listItems = result.flat()

  return { listItems }
}
