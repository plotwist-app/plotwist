import postgres from 'postgres'
import { insertListItem } from '@/db/repositories/list-item-repository'
import { PgIntegrityConstraintViolation } from '@/db/utils/postgres-errors'
import type { InsertListItem } from '../../entities/list-item'
import { ListNotFoundError } from '../../errors/list-not-found-error'

export async function createListItemService(
  values: InsertListItem,
  userId: string
) {
  try {
    const [listItem] = await insertListItem(values)

    return { listItem }
  } catch (error) {
    if (error instanceof postgres.PostgresError) {
      if (error.code === PgIntegrityConstraintViolation.ForeignKeyViolation) {
        return new ListNotFoundError()
      }
    }

    throw error
  }
}
