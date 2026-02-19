import { selectListItems } from '@/db/repositories/list-item-repository'
import { getListById } from '@/db/repositories/list-repository'
import { ListNotFoundError } from '../../errors/list-not-found-error'

type GetListItemsInput = { listId: string }

export async function getListItemsService({ listId }: GetListItemsInput) {
  const [list] = await getListById(listId)

  if (!list) {
    return new ListNotFoundError()
  }

  const listItems = await selectListItems(listId)

  return { listItems }
}
