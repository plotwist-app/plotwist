import { upsertUserItem } from '@/db/repositories/user-item-repository'
import type { InsertUserItem, UserItem } from '@/domain/entities/user-item'
import * as changeKeys from 'change-case/keys'

export async function upsertUserItemService(values: InsertUserItem) {
  const [userItem] = await upsertUserItem(values)

  return { userItem: changeKeys.camelCase(userItem) as UserItem }
}
