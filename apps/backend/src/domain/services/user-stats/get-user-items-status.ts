import { selectUserItemStatus } from '@/infra/db/repositories/user-item-repository'

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
