import type {
  UserActivityEntityType,
  UserActivityType,
} from '@/@types/user-activity'
import {
  deleteFollowUserActivity,
  deleteUserActivity,
  deleteUserActivityById,
} from '@/infra/db/repositories/user-activities'

type DeleteUserActivityParams = {
  activityType: UserActivityType
  entityType: UserActivityEntityType
  entityId: string
  userId: string
}

export async function deleteUserActivityByIdService(activityId: string) {
  await deleteUserActivityById(activityId)
}

export async function deleteUserActivityByEntityService(
  params: DeleteUserActivityParams
) {
  await deleteUserActivity(params)
}

export async function deleteFollowUserActivityService(
  followedId: string,
  followerId: string,
  userId: string
) {
  await deleteFollowUserActivity({ followedId, followerId, userId })
}
