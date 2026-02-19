import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { tmdb } from '@/infra/adapters/tmdb'
import { makeUser } from '@/test/factories/make-user'
import { makeUserItem } from '@/test/factories/make-user-item'
import { redisClient } from '@/test/mocks/redis'
import { getUserWatchedCountriesService } from './get-user-watched-countries'

vi.mock('@/adapters/tmdb', () => ({
  tmdb: {
    movies: {
      details: vi.fn(),
    },
  },
}))

const SCIENCE_FICTION_MOVIES = [157336] // Interestellar

describe('get user watched countries', () => {
  beforeEach(() => {
    ;(tmdb.movies.details as Mock).mockResolvedValue({
      id: 157336,
      title: 'Interstellar',
      overview: '',
      poster_path: '/poster.jpg',
      backdrop_path: '/backdrop.jpg',
      release_date: '2014-11-05',
      production_countries: [
        { iso_3166_1: 'US', name: 'United States of America' },
        { iso_3166_1: 'GB', name: 'United Kingdom' },
      ],
    })
  })

  it('should be able to get user watched countries with right values', async () => {
    const user = await makeUser()

    for (const movieId of SCIENCE_FICTION_MOVIES) {
      await makeUserItem({
        userId: user.id,
        mediaType: 'MOVIE',
        status: 'WATCHED',
        tmdbId: movieId,
      })
    }

    const sut = await getUserWatchedCountriesService({
      userId: user.id,
      redis: redisClient,
      language: 'en-US',
    })

    expect(sut).toEqual({
      watchedCountries: expect.arrayContaining([
        expect.objectContaining({
          count: SCIENCE_FICTION_MOVIES.length,
          percentage: 100,
        }),
      ]),
    })
  })
})
