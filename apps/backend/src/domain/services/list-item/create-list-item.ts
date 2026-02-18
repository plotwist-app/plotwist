import { insertListItem } from '@/db/repositories/list-item-repository'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'
import { isForeignKeyViolation } from '@/db/utils/postgres-errors'
import type { InsertListItem } from '../../entities/list-item'
import { ListNotFoundError } from '../../errors/list-not-found-error'

const createListItemServiceImpl = async (
  values: InsertListItem,
  _userId: string
) => {
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

export const createListItemService = withServiceTracing(
  'create-list-item',
  createListItemServiceImpl
)
