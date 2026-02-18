import { selectFollowers } from '@/db/repositories/followers-repository'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'

export type GetFollowersInput = {
  followedId?: string
  followerId?: string
  cursor?: string
  pageSize: number
}

const getFollowersServiceImpl = async (input: GetFollowersInput) => {
  const followers = await selectFollowers(input)

  return {
    followers: followers.slice(0, input.pageSize),
    nextCursor: followers[input.pageSize]?.createdAt.toISOString() || null,
  }
}

export const getFollowersService = withServiceTracing(
  'get-followers',
  getFollowersServiceImpl
)
