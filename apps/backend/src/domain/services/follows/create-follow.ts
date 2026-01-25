import { insertFollow } from '@/db/repositories/followers-repository'
import { isUniqueViolation } from '@/db/utils/postgres-errors'
import { FollowAlreadyRegisteredError } from '@/domain/errors/follow-already-registered'

export type CreateFollowServiceInput = {
  followerId: string
  followedId: string
}

export async function createFollowService({
  followedId,
  followerId,
}: CreateFollowServiceInput) {
  try {
    const [follow] = await insertFollow({ followedId, followerId })

    return { follow }
  } catch (error) {
    if (isUniqueViolation(error)) {
      return new FollowAlreadyRegisteredError()
    }

    throw error
  }
}
