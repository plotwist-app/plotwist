import * as changeKeys from 'change-case/keys'
import type { InsertUserItem, UserItem } from '@/domain/entities/user-item'
import { upsertUserItem } from '@/infra/db/repositories/user-item-repository'

export async function upsertUserItemService(values: InsertUserItem) {
  const [userItem] = await upsertUserItem(values)

  return { userItem: changeKeys.camelCase(userItem) as UserItem }
}
