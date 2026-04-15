import { selectFollowers } from '@/infra/db/repositories/followers-repository'

export type GetFollowersInput = {
  followedId?: string
  followerId?: string
  cursor?: string
  pageSize: number
}

export async function getFollowersService(input: GetFollowersInput) {
  const followers = await selectFollowers(input)

  return {
    followers: followers.slice(0, input.pageSize),
    nextCursor: followers[input.pageSize]?.createdAt.toISOString() || null,
  }
}
