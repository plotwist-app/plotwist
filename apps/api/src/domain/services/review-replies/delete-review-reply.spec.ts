import { ReviewReplyNotFoundError } from '@/domain/errors/review-reply-not-found-error'
import { makeReview } from '@/test/factories/make-review'
import { makeReviewReply } from '@/test/factories/make-review-reply'
import { makeUser } from '@/test/factories/make-user'
import { faker } from '@faker-js/faker'
import { describe, expect, it } from 'vitest'
import { deleteReviewReply } from './delete-review-reply'

describe('delete review reply', () => {
  it('should be able to delete a review reply', async () => {
    const { id: userId } = await makeUser()

    const review = await makeReview({ userId })
    const reviewReply = await makeReviewReply({
      userId,
      reviewId: review.id,
    })

    const sut = await deleteReviewReply(reviewReply.id)

    expect(sut).toEqual({
      reviewReply: expect.objectContaining(reviewReply),
    })
  })

  it('should be able to fail when reply id does not exists', async () => {
    const sut = await deleteReviewReply(faker.string.uuid())

    expect(sut).toBeInstanceOf(ReviewReplyNotFoundError)
  })
})
