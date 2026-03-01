import { selectUserItemStatus } from '@/infra/db/repositories/user-item-repository'

type GetUserItemsStatusServiceInput = {
  userId: string
  dateRange?: { startDate: Date | undefined; endDate: Date | undefined }
}

export async function getUserItemsStatusService({
  userId,
  dateRange,
}: GetUserItemsStatusServiceInput) {
  const userItems = await selectUserItemStatus(
    userId,
    dateRange?.startDate,
    dateRange?.endDate
  )

  return {
    userItems,
  }
}
