import { describe, expect, it } from 'vitest'

import { randomUUID } from 'node:crypto'
import { ReviewNotFoundError } from '@/domain/errors/review-not-found-error'
import { makeReview } from '@/test/factories/make-review'
import { makeUser } from '@/test/factories/make-user'
import { getReviewById } from './get-review-by-id'

describe('get review by id', () => {
  it('should be able to get an review by id', async () => {
    const { id: userId } = await makeUser()

    const { id } = await makeReview({ userId })

    const sut = await getReviewById(id)

    expect(sut).toBeTruthy()
  })

  it('should be able to fail when review id does not exists', async () => {
    const randomId = randomUUID()

    const sut = await getReviewById(randomId)

    expect(sut).toBeInstanceOf(ReviewNotFoundError)
  })
})
