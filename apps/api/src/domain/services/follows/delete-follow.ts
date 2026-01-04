import { deleteFollow } from '@/db/repositories/followers-repository'

export type DeleteFollowServiceInput = {
  followerId: string
  followedId: string
}

export async function deleteFollowService({
  followedId,
  followerId,
}: DeleteFollowServiceInput) {
  const [deletedFollow] = await deleteFollow({ followedId, followerId })

  return { follow: deletedFollow }
}
