import { selectFollowers } from '@/db/repositories/followers-repository'
import { selectUserActivities } from '@/db/repositories/user-activities'

type GetUserNetworkActivitiesServiceInput = {
  userId: string
  cursor?: string
  pageSize: number
}

export async function getUserNetworkActivitiesService(
  input: GetUserNetworkActivitiesServiceInput
) {
  const following = await selectFollowers({
    followerId: input.userId,
    cursor: input.cursor,
    pageSize: input.pageSize,
  })

  if (following.length === 0) {
    return {
      userActivities: [],
      nextCursor: null,
    }
  }

  const activities = await selectUserActivities({
    userIds: following.map(follower => follower.followedId),
    cursor: input.cursor,
    pageSize: input.pageSize,
  })

  const lastActivity = activities[activities.length - 1]
  const nextCursor = lastActivity?.createdAt.toISOString() || null

  return {
    userActivities: activities.slice(0, input.pageSize),
    nextCursor,
  }
}
