import { getFollow } from '@/infra/db/repositories/followers-repository'

export type GetFollowServiceInput = {
  followerId: string
  followedId: string
}

export async function getFollowService({
  followedId,
  followerId,
}: GetFollowServiceInput) {
  const [follow] = await getFollow({ followedId, followerId })

  return { follow: follow || null }
}
