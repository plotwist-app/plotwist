import { faker } from '@faker-js/faker'
import { describe, expect, it } from 'vitest'

import { makeRawReview } from '@/test/factories/make-review'
import { makeUser } from '@/test/factories/make-user'
import { UserNotFoundError } from '../../errors/user-not-found'
import { createReviewService } from './create-review'

describe('create review', () => {
  it('should be able to create an review', async () => {
    const { id: userId } = await makeUser()

    const review = makeRawReview({ userId: userId })
    const sut = await createReviewService(review)

    expect(sut).toEqual({
      review: expect.objectContaining(review),
    })
  })

  it('should be able to fail when user id does not exists', async () => {
    const review = makeRawReview({ userId: faker.string.uuid() })
    const sut = await createReviewService(review)

    expect(sut).toBeInstanceOf(UserNotFoundError)
  })
})
