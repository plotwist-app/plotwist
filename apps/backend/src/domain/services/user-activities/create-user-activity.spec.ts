import { randomUUID } from 'node:crypto'
import { db } from '@/db'
import { schema } from '@/db/schema'
import type { InsertUserActivity } from '@/domain/entities/user-activity'
import { makeUser } from '@/test/factories/make-user'
import { eq } from 'drizzle-orm'
import { describe, expect, it } from 'vitest'
import { createUserActivity } from './create-user-activity'

describe('createUserActivity', () => {
  it('should create a like activity for a review', async () => {
    const user = await makeUser()

    const activity: InsertUserActivity = {
      userId: user.id,
      activityType: 'LIKE_REVIEW',
      entityId: randomUUID(),
      entityType: 'REVIEW',
    }

    await createUserActivity(activity)

    const result = await db.query.userActivities.findFirst({
      where: eq(schema.userActivities.userId, activity.userId),
    })

    expect(result).toBeDefined()
    expect(result?.activityType).toBe('LIKE_REVIEW')
    expect(result?.entityId).toBe(activity.entityId)
    expect(result?.entityType).toBe('REVIEW')
  })

  it('should create a like activity for a list', async () => {
    const user = await makeUser()

    const activity: InsertUserActivity = {
      userId: user.id,
      activityType: 'LIKE_LIST',
      entityId: randomUUID(),
      entityType: 'LIST',
    }

    await createUserActivity(activity)

    const result = await db.query.userActivities.findFirst({
      where: eq(schema.userActivities.userId, activity.userId),
    })

    expect(result).toBeDefined()
    expect(result?.activityType).toBe('LIKE_LIST')
    expect(result?.entityId).toBe(activity.entityId)
    expect(result?.entityType).toBe('LIST')
  })

  it('should create a follow activity', async () => {
    const user = await makeUser()

    const activity: InsertUserActivity = {
      userId: user.id,
      activityType: 'FOLLOW_USER',
      entityId: randomUUID(),
      metadata: {
        followerId: randomUUID(),
        followedId: randomUUID(),
      },
    }

    await createUserActivity(activity)

    const result = await db.query.userActivities.findFirst({
      where: eq(schema.userActivities.userId, activity.userId),
    })

    expect(result).toBeDefined()
    expect(result?.activityType).toBe('FOLLOW_USER')
    expect(result?.entityId).toBe(activity.entityId)
  })

  it('should create a review activity', async () => {
    const user = await makeUser()

    const activity: InsertUserActivity = {
      userId: user.id,
      activityType: 'CREATE_REVIEW',
      entityId: randomUUID(),
      metadata: {
        tmdbId: 123,
        mediaType: 'TV_SHOW',
      },
    }

    await createUserActivity(activity)

    const result = await db.query.userActivities.findFirst({
      where: eq(schema.userActivities.userId, activity.userId),
    })

    expect(result).toBeDefined()
    expect(result?.activityType).toBe('CREATE_REVIEW')
    expect(result?.entityId).toBe(activity.entityId)
  })

  it('should throw error if database operation fails', async () => {
    const user = await makeUser()

    const activity: InsertUserActivity = {
      userId: user.id,
      activityType: 'CREATE_REVIEW',
      entityId: randomUUID(),
      metadata: {
        tmdbId: 123,
        mediaType: 'TV_SHOW',
      },
    }

    activity.userId = 'invalid-uuid'

    await expect(createUserActivity(activity)).rejects.toThrow()
  })
})
