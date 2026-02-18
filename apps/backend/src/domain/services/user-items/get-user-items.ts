import { selectUserItems } from '@/db/repositories/user-item-repository'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'
import type { SelectUserItems } from '@/domain/entities/user-item'

const getUserItemsServiceImpl = async (input: SelectUserItems) => {
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

export const getUserItemsService = withServiceTracing(
  'get-user-items',
  getUserItemsServiceImpl
)
