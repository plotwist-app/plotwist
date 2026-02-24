import type { SelectUserActivities } from '@/domain/entities/user-activity'
import { selectUserActivities } from '@/infra/db/repositories/user-activities'

export async function getUserActivitiesService(values: SelectUserActivities) {
  const userActivities = await selectUserActivities(values)

  const lastUserActivity = userActivities[values.pageSize]
  const nextCursor = lastUserActivity?.createdAt.toISOString() || null

  return {
    userActivities: userActivities.slice(0, values.pageSize),
    nextCursor: nextCursor,
  }
}
