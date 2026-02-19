import { selectUserItemsCount } from '@/infra/db/repositories/user-item-repository'

type GetUserItemsCountInput = {
  userId: string
}

export async function getUserItemsCountService({
  userId,
}: GetUserItemsCountInput) {
  const count = await selectUserItemsCount(userId)

  return {
    count,
  }
}
