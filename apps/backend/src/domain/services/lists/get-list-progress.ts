import { selectListItems } from '@/db/repositories/list-item-repository'
import { selectAllUserItemsByStatus } from '@/db/repositories/user-item-repository'

type GetListProgressServiceParams = {
  id: string
  authenticatedUserId: string
}

export async function getListProgressService({
  id,
  authenticatedUserId,
}: GetListProgressServiceParams) {
  const listItems = await selectListItems(id)
  if (listItems.length === 0) {
    return {
      total: 0,
      completed: 0,
      percentage: 0,
    }
  }

  const userItems = await selectAllUserItemsByStatus({
    userId: authenticatedUserId,
    status: 'WATCHED',
  })

  const watchedItems = listItems.filter(listItem =>
    userItems.some(
      userItem =>
        userItem.tmdbId === listItem.tmdbId &&
        userItem.mediaType === listItem.mediaType
    )
  )

  const percentage = Math.round((watchedItems.length / listItems.length) * 100)

  return {
    total: listItems.length,
    completed: watchedItems.length,
    percentage,
  }
}
