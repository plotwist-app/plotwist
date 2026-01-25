import { selectUserItemStatus } from '@/db/repositories/user-item-repository'

type GetUserItemsStatusServiceInput = {
  userId: string
}

export async function getUserItemsStatusService({
  userId,
}: GetUserItemsStatusServiceInput) {
  const userItems = await selectUserItemStatus(userId)

  return {
    userItems,
  }
}
