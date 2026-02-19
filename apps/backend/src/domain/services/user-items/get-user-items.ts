import { selectUserItems } from '@/db/repositories/user-item-repository'
import type { SelectUserItems } from '@/domain/entities/user-item'

export async function getUserItemsService(input: SelectUserItems) {
  try {
    const userItems = await selectUserItems({ ...input })

    const lastUserItem = userItems[input.pageSize]
    const nextCursor = lastUserItem?.updatedAt.toISOString() || null

    const slicedUserItems = userItems.slice(0, input.pageSize)

    return { userItems: slicedUserItems, nextCursor }
  } catch (error) {
    console.error(error)
    throw error
  }
}
