import { describe, expect, it } from 'vitest'

import { deleteUserService } from '@/domain/services/users/delete-user'
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

  it('should not return reviews from deleted users', async () => {
    const deletedTmdbId = 240

    const activeUser = await makeUser()
    const deletedUser = await makeUser()

    const activeReview = await makeReview({
      userId: activeUser.id,
      tmdbId: deletedTmdbId,
      mediaType: MEDIA_TYPE,
    })

    const deletedUserReview = await makeReview({
      userId: deletedUser.id,
      tmdbId: deletedTmdbId,
      mediaType: MEDIA_TYPE,
    })

    await deleteUserService(deletedUser.id)

    const sut = await getReviewsService({
      tmdbId: deletedTmdbId,
      mediaType: MEDIA_TYPE,
      interval: 'ALL_TIME',
    })

    const reviewIds = sut.reviews.map(review => review.id)

    expect(reviewIds).toContain(activeReview.id)
    expect(reviewIds).not.toContain(deletedUserReview.id)
  })
})
