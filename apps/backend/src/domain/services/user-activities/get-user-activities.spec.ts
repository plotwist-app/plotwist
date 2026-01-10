import { randomUUID } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { makeUser } from '@/test/factories/make-user'
import { createUserActivity } from './create-user-activity'
import { getUserActivitiesService } from './get-user-activities'

describe('get user activities', () => {
  it('should be able to get user activities', async () => {
    const user = await makeUser()

    await Promise.all(
      Array.from({ length: 21 }, async () => {
        return await createUserActivity({
          userId: user.id,
          activityType: 'WATCH_EPISODE',
          entityId: randomUUID(),
          entityType: 'REVIEW',
        })
      })
    )

    const sut = await getUserActivitiesService({
      pageSize: 20,
      userIds: [user.id],
    })

    expect(sut.userActivities).toHaveLength(20)
    expect(sut.nextCursor).toBeTruthy()
  })
})
