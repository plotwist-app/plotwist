import { describe, expect, it } from 'vitest'

import { makeReview } from '@/test/factories/make-review'
import { makeUser } from '@/test/factories/make-user'
import { getReviewsService } from './get-reviews'

const TMDB_ID = 238
const MEDIA_TYPE = 'MOVIE'

describe('get reviews', () => {
  it('should be able to get reviews', async () => {
    const user = await makeUser()

    const firstReview = await makeReview({
      userId: user.id,
      tmdbId: TMDB_ID,
      mediaType: MEDIA_TYPE,
    })

    const secondReview = await makeReview({
      userId: user.id,
      tmdbId: TMDB_ID,
      mediaType: MEDIA_TYPE,
    })

    const sut = await getReviewsService({
      tmdbId: TMDB_ID,
      mediaType: MEDIA_TYPE,
      interval: 'ALL_TIME',
    })

    expect(sut).toEqual({
      reviews: expect.arrayContaining([
        expect.objectContaining({ id: firstReview.id }),
        expect.objectContaining({ id: secondReview.id }),
      ]),
    })
  })
})
