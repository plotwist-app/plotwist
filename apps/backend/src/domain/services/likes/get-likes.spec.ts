import { beforeAll, describe, expect, it } from 'vitest'
import type { User } from '@/domain/entities/user'
import { makeLike } from '@/test/factories/make-like'
import { makeReview } from '@/test/factories/make-review'
import { makeUser } from '@/test/factories/make-user'
import { getLikesService } from './get-likes'

let user: User

describe('get likes', () => {
  beforeAll(async () => {
    user = await makeUser()
  })

  it('should be able to get likes with user information', async () => {
    const review = await makeReview({ userId: user.id })

    const list = await makeLike({
      entityType: 'REVIEW',
      userId: user.id,
      entityId: review.id,
    })

    const sut = await getLikesService(review.id)

    expect(sut).toEqual({
      likes: expect.arrayContaining([
        expect.objectContaining({
          ...list,
          user: {
            id: user.id,
            username: user.username,
            avatarUrl: user.avatarUrl,
            subscriptionType: 'MEMBER',
          },
        }),
      ]),
    })
  })
})
