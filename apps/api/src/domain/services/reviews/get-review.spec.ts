import { describe, expect, it } from 'vitest'

import { makeReview } from '@/test/factories/make-review'
import { makeUser } from '@/test/factories/make-user'
import { getReviewService } from './get-review'

const TMDB_ID = 238
const MEDIA_TYPE = 'MOVIE'

describe('get review', () => {
  it('should be able to get review', async () => {
    const user = await makeUser()

    const review = await makeReview({
      userId: user.id,
      tmdbId: TMDB_ID,
      mediaType: MEDIA_TYPE,
    })

    const sut = await getReviewService({
      tmdbId: TMDB_ID,
      mediaType: MEDIA_TYPE,
      userId: user.id,
    })

    expect(sut).toEqual({
      review: expect.objectContaining({ id: review.id, review: review.review }),
    })
  })
})
