import { reorderUserItems } from '@/db/repositories/user-item-repository'

interface ReorderUserItemsInput {
  userId: string
  status: string
  orderedIds: string[]
}

export async function reorderUserItemsService({
  userId,
  status,
  orderedIds,
}: ReorderUserItemsInput) {
  await reorderUserItems(userId, status, orderedIds)
}
