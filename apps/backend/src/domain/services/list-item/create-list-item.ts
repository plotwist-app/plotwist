import { insertListItem } from '@/db/repositories/list-item-repository'
import { isForeignKeyViolation } from '@/db/utils/postgres-errors'
import type { InsertListItem } from '../../entities/list-item'
import { ListNotFoundError } from '../../errors/list-not-found-error'

export async function createListItemService(
  values: InsertListItem,
  _userId: string
) {
  try {
    const [listItem] = await insertListItem(values)

    return { listItem }
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      return new ListNotFoundError()
    }

    throw error
  }
}
