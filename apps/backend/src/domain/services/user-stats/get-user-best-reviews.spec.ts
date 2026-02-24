import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { tmdb } from '@/infra/adapters/tmdb'
import { makeReview } from '@/test/factories/make-review'
import { makeUser } from '@/test/factories/make-user'
import { redisClient } from '@/test/mocks/redis'
import { getUserBestReviewsService } from './get-user-best-reviews'

vi.mock('@/infra/adapters/tmdb', () => ({
  tmdb: {
    tv: {
      details: vi.fn(),
    },
    movies: {
      details: vi.fn(),
    },
  },
}))

describe('get user best reviews', () => {
  beforeEach(() => {
    ;(tmdb.tv.details as Mock).mockImplementation((tmdbId: number) => {
      if (tmdbId === 2316) {
        return Promise.resolve({
          id: 2316,
          name: 'The Office',
          overview: '',
          poster_path: '/poster.jpg',
          backdrop_path: '/backdrop.jpg',
          first_air_date: '2005-03-24',
        })
      }
      return Promise.resolve({})
    })

    ;(tmdb.movies.details as Mock).mockImplementation((tmdbId: number) => {
      if (tmdbId === 414906) {
        return Promise.resolve({
          id: 414906,
          title: 'The Batman',
          overview: '',
          poster_path: '/poster.jpg',
          backdrop_path: '/backdrop.jpg',
          release_date: '2022-03-04',
        })
      }
      return Promise.resolve({})
    })
  })

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
