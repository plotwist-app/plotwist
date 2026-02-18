import { deleteFollow } from '@/db/repositories/followers-repository'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'

export type DeleteFollowServiceInput = {
  followerId: string
  followedId: string
}

const deleteFollowServiceImpl = async ({
  followedId,
  followerId,
}: DeleteFollowServiceInput) => {
  const [deletedFollow] = await deleteFollow({ followedId, followerId })

  return { follow: deletedFollow }
}

export const deleteFollowService = withServiceTracing(
  'delete-follow',
  deleteFollowServiceImpl
)
