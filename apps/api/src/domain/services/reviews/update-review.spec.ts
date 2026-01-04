import { describe, expect, it } from 'vitest'

import { makeReview } from '@/test/factories/make-review'
import { makeUser } from '@/test/factories/make-user'
import { updateReviewService } from './update-review'

const TMDB_ID = 238
const MEDIA_TYPE = 'MOVIE'

describe('update review', () => {
  it('should be able to update review', async () => {
    const user = await makeUser()

    const review = await makeReview({
      userId: user.id,
      tmdbId: TMDB_ID,
      mediaType: MEDIA_TYPE,
    })

    const result = await updateReviewService({
      id: review.id,
      rating: 1,
      review: 'updated review',
    })

    expect(result).toEqual({
      review: expect.objectContaining({
        rating: 1,
        review: 'updated review',
      }),
    })
  })
})
