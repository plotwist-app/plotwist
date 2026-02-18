import { getFollow } from '@/db/repositories/followers-repository'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'

export type GetFollowServiceInput = {
  followerId: string
  followedId: string
}

const getFollowServiceImpl = async ({
  followedId,
  followerId,
}: GetFollowServiceInput) => {
  const [follow] = await getFollow({ followedId, followerId })

  return { follow: follow || null }
}

export const getFollowService = withServiceTracing(
  'get-follow',
  getFollowServiceImpl
)
