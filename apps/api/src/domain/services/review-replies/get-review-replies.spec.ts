import { makeReview } from '@/test/factories/make-review'
import { makeReviewReply } from '@/test/factories/make-review-reply'
import { makeUser } from '@/test/factories/make-user'
import { getReviewRepliesService } from './get-review-replies'

describe('fetchReviewReplies', () => {
  it('should return review replies for a given reviewId', async () => {
    const user = await makeUser()
    const review = await makeReview({ userId: user.id })
    const reply = await makeReviewReply({
      reviewId: review.id,
      userId: user.id,
    })

    const result = await getReviewRepliesService(review.id, user.id)

    expect(result).toEqual({
      reviewReplies: expect.arrayContaining([expect.objectContaining(reply)]),
    })
  })
})
