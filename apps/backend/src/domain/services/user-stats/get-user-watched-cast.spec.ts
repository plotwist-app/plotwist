import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { tmdb } from '@/infra/adapters/tmdb'
import { makeUser } from '@/test/factories/make-user'
import { makeUserItem } from '@/test/factories/make-user-item'
import { redisClient } from '@/test/mocks/redis'
import { getUserWatchedCastService } from './get-user-watched-cast'

vi.mock('@/infra/adapters/tmdb', () => ({
  tmdb: {
    movies: {
      details: vi.fn(),
    },
    credits: vi.fn(),
  },
}))

const ADAM_SANDLER_MOVIES = [9339, 1824] // Click, 50 First Dates

describe('get user watched cast', () => {
  beforeEach(() => {
    ;(tmdb.movies.details as Mock).mockResolvedValue({
      id: 9339,
      title: 'Click',
      overview: '',
      poster_path: '/poster.jpg',
      backdrop_path: '/backdrop.jpg',
      release_date: '2006-06-23',
    })

    ;(tmdb.credits as Mock).mockResolvedValue({
      id: 9339,
      cast: [
        {
          id: 19274,
          name: 'Adam Sandler',
          character: 'Michael Newman',
          order: 0,
          known_for_department: 'Acting',
          profile_path: '/profile.jpg',
        },
      ],
      crew: [],
    })
  })

  it('should be able to get user watched cast with right values', async () => {
    const user = await makeUser()

    for (const movieId of ADAM_SANDLER_MOVIES) {
      await makeUserItem({
        userId: user.id,
        mediaType: 'MOVIE',
        status: 'WATCHED',
        tmdbId: movieId,
      })
    }

    const sut = await getUserWatchedCastService({
      userId: user.id,
      redis: redisClient,
    })

    expect(sut).toEqual({
      watchedCast: expect.arrayContaining([
        expect.objectContaining({
          name: 'Adam Sandler',
          count: 2,
          percentage: 100,
        }),
      ]),
    })
  })
})
