import { makeReview } from '@/test/factories/make-review'
import { makeUser } from '@/test/factories/make-user'
import { redisClient } from '@/test/mocks/redis'
import { getUserBestReviewsService } from './get-user-best-reviews'

describe('get user best reviews', () => {
  it('should be able to get user best reviews', async () => {
    const user = await makeUser()

    const tvShowReview = await makeReview({
      userId: user.id,
      rating: 5,
      mediaType: 'TV_SHOW',
      tmdbId: 2316, // The Office
    })

    const movieReview = await makeReview({
      userId: user.id,
      rating: 5,
      mediaType: 'MOVIE',
      tmdbId: 414906, // The Batman
    })

    const sut = await getUserBestReviewsService({
      userId: user.id,
      language: 'en-US',
      redis: redisClient,
    })

    expect(sut).toEqual({
      bestReviews: expect.arrayContaining([
        expect.objectContaining({
          id: tvShowReview.id,
        }),
        expect.objectContaining({
          id: movieReview.id,
        }),
      ]),
    })
  })

  it('should not include reviews with season number', async () => {
    const user = await makeUser()

    await makeReview({
      userId: user.id,
      rating: 5,
      mediaType: 'TV_SHOW',
      tmdbId: 2316, // The Office
      seasonNumber: 1,
    })

    const sut = await getUserBestReviewsService({
      userId: user.id,
      language: 'en-US',
      redis: redisClient,
    })

    expect(sut.bestReviews.length).toBe(0)
  })

  it('should not include reviews with episode number', async () => {
    const user = await makeUser()

    await makeReview({
      userId: user.id,
      rating: 5,
      mediaType: 'TV_SHOW',
      tmdbId: 2316, // The Office
      episodeNumber: 1,
    })

    const sut = await getUserBestReviewsService({
      userId: user.id,
      language: 'en-US',
      redis: redisClient,
    })

    expect(sut.bestReviews.length).toBe(0)
  })
})
