import { beforeAll, describe, expect, it } from 'vitest'

import { randomUUID } from 'node:crypto'
import type { User } from '@/domain/entities/user'
import { ReviewNotFoundError } from '@/domain/errors/review-not-found-error'
import { UserNotFoundError } from '@/domain/errors/user-not-found'
import { makeReview } from '@/test/factories/make-review'
import { makeUser } from '@/test/factories/make-user'
import { faker } from '@faker-js/faker'
import { createReviewReplyService } from './create-review-reply'

let user: User

describe('create review reply', () => {
  beforeAll(async () => {
    user = await makeUser()
  })

  it('should be able to create a review reply', async () => {
    const review = await makeReview({ userId: user.id })
    const reply = faker.lorem.sentence()

    const sut = await createReviewReplyService({
      userId: user.id,
      reviewId: review.id,
      reply,
    })

    expect(sut).toEqual({
      reviewReply: expect.objectContaining({
        reply,
      }),
    })
  })

  it('should be able to fail when user id does not exists', async () => {
    const review = await makeReview({ userId: user.id })
    const reply = faker.lorem.sentence()

    const sut = await createReviewReplyService({
      userId: randomUUID(),
      reviewId: review.id,
      reply,
    })

    expect(sut).toBeInstanceOf(UserNotFoundError)
  })

  it('should be able to fail when review id does not exists', async () => {
    const reply = faker.lorem.sentence()

    const sut = await createReviewReplyService({
      userId: user.id,
      reviewId: randomUUID(),
      reply,
    })

    expect(sut).toBeInstanceOf(ReviewNotFoundError)
  })
})
