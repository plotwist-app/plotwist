import { insertFollow } from '@/db/repositories/followers-repository'
import { isUniqueViolation } from '@/db/utils/postgres-errors'
import { FollowAlreadyRegisteredError } from '@/domain/errors/follow-already-registered'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'

export type CreateFollowServiceInput = {
  followerId: string
  followedId: string
}

const createFollowServiceImpl = async ({
  followedId,
  followerId,
}: CreateFollowServiceInput) => {
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

export const createFollowService = withServiceTracing(
  'create-follow',
  createFollowServiceImpl
)
