import { describe, expect, it } from 'vitest'

import { randomUUID } from 'node:crypto'
import { UserNotFoundError } from '@/domain/errors/user-not-found'
import { makeReview } from '@/test/factories/make-review'
import { makeReviewReply } from '@/test/factories/make-review-reply'
import { makeUser } from '@/test/factories/make-user'
import { faker } from '@faker-js/faker'
import { createReviewReplyService } from './create-review-reply'
import { updateReviewReply } from './update-review-reply'

describe('update review reply', () => {
  it('should be able to update a review reply', async () => {
    const { id: userId } = await makeUser()

    const review = await makeReview({ userId })
    const reply = await makeReviewReply({ reviewId: review.id, userId })

    const lorem = faker.lorem.sentence()
    const sut = await updateReviewReply(reply.id, lorem)

    expect(sut).toEqual({
      reviewReply: expect.objectContaining({
        reply: lorem,
      }),
    })
  })

  it('should be able to fail when user id does not exists', async () => {
    const { id: userId } = await makeUser()

    const review = await makeReview({ userId })
    const reply = faker.lorem.sentence()

    const sut = await createReviewReplyService({
      userId: randomUUID(),
      reviewId: review.id,
      reply,
    })

    expect(sut).toBeInstanceOf(UserNotFoundError)
  })
})
