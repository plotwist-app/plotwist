import { FollowAlreadyRegisteredError } from '@/domain/errors/follow-already-registered'
import { insertFollow } from '@/infra/db/repositories/followers-repository'
import { isUniqueViolation } from '@/infra/db/utils/postgres-errors'

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
