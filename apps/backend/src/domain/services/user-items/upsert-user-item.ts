import * as changeKeys from 'change-case/keys'

import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'
import { upsertUserItem } from '@/db/repositories/user-item-repository'
import type { InsertUserItem, UserItem } from '@/domain/entities/user-item'

const upsertUserItemServiceImpl = async (values: InsertUserItem) => {
  const [userItem] = await upsertUserItem(values)

  return { userItem: changeKeys.camelCase(userItem) as UserItem }
}

export const upsertUserItemService = withServiceTracing(
  'upsert-user-item',
  upsertUserItemServiceImpl
)
