import type { SelectAllUserItems } from '@/domain/entities/user-item'
import { selectAllUserItemsByStatus } from '@/infra/db/repositories/user-item-repository'

export async function getAllUserItemsService(input: SelectAllUserItems) {
  const userItems = await selectAllUserItemsByStatus(input)

  return { userItems: userItems }
}
