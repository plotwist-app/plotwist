import { makeReview } from '@/test/factories/make-review'
import { makeUser } from '@/test/factories/make-user'
import { getUserReviewsCountService } from './get-user-reviews-count'

describe('get user reviews count', () => {
  it('should be able to get reviews count', async () => {
    const user = await makeUser()

    await makeReview({ userId: user.id })
    await makeReview({ userId: user.id })
    await makeReview({ userId: user.id })

    const sut = await getUserReviewsCountService(user.id)

    expect(sut).toEqual({
      reviewsCount: 3,
    })
  })
})
