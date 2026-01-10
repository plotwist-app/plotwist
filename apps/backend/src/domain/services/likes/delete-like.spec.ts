import { beforeAll, describe, expect, it } from 'vitest'
import type { User } from '@/domain/entities/user'
import { makeLike } from '@/test/factories/make-like'
import { makeReview } from '@/test/factories/make-review'
import { makeUser } from '@/test/factories/make-user'
import { deleteLikeService } from './delete-like'

let user: User

describe('delete like', () => {
  beforeAll(async () => {
    user = await makeUser()
  })

  it('should be able to delete like', async () => {
    const review = await makeReview({ userId: user.id })
    const like = await makeLike({
      entityType: 'REVIEW',
      userId: user.id,
      entityId: review.id,
    })

    const sut = await deleteLikeService(like.id)

    expect(sut).toEqual({
      like: expect.objectContaining(like),
    })
  })
})
