import { randomUUID } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { makeUser } from '@/test/factories/make-user'
import { createUserActivity } from './create-user-activity'
import {
  deleteFollowUserActivityService,
  deleteUserActivityByEntityService,
  deleteUserActivityByIdService,
} from './delete-user-activity'
import { getUserActivitiesService } from './get-user-activities'

describe('delete user activity', () => {
  it('should be able to delete user activity', async () => {
    const user = await makeUser()

    await createUserActivity({
      userId: user.id,
      activityType: 'WATCH_EPISODE',
      entityId: randomUUID(),
      entityType: 'REVIEW',
    })

    const { userActivities } = await getUserActivitiesService({
      pageSize: 20,
      userIds: [user.id],
    })

    await deleteUserActivityByIdService(userActivities[0].id)

    const sut = await getUserActivitiesService({
      pageSize: 20,
      userIds: [user.id],
    })

    expect(sut.userActivities).toHaveLength(0)
    expect(sut.nextCursor).toBeFalsy()
  })
})

describe('delete user activity by entity', () => {
  it('should be able to delete user activity by entity', async () => {
    const user = await makeUser()

    await createUserActivity({
      userId: user.id,
      activityType: 'WATCH_EPISODE',
      entityId: randomUUID(),
      entityType: 'REVIEW',
    })

    const { userActivities } = await getUserActivitiesService({
      pageSize: 20,
      userIds: [user.id],
    })

    await deleteUserActivityByEntityService({
      activityType: 'WATCH_EPISODE',
      entityType: 'REVIEW',
      entityId: userActivities[0].entityId ?? '',
      userId: user.id,
    })

    const sut = await getUserActivitiesService({
      pageSize: 20,
      userIds: [user.id],
    })

    expect(sut.userActivities).toHaveLength(0)
    expect(sut.nextCursor).toBeFalsy()
  })
})

describe('delete follow user activity', () => {
  it('should be able to delete follow user activity', async () => {
    const user = await makeUser()

    const followedId = randomUUID()

    await createUserActivity({
      userId: user.id,
      activityType: 'FOLLOW_USER',
      entityId: randomUUID(),
      entityType: 'REVIEW',
      metadata: {
        followedId,
        followerId: user.id,
      },
    })

    await deleteFollowUserActivityService(followedId, user.id, user.id)

    const sut = await getUserActivitiesService({
      pageSize: 20,
      userIds: [user.id],
    })

    expect(sut.userActivities).toHaveLength(0)
    expect(sut.nextCursor).toBeFalsy()
  })
})
