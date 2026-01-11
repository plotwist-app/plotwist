import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { tmdb } from '@/adapters/tmdb'
import { makeUser } from '@/test/factories/make-user'
import { makeUserItem } from '@/test/factories/make-user-item'
import { redisClient } from '@/test/mocks/redis'
import { getUserWatchedGenresService } from './get-user-watched-genres'

vi.mock('@/adapters/tmdb', () => ({
  tmdb: {
    movies: {
      details: vi.fn(),
    },
  },
}))

const SCIENCE_FICTION_MOVIES = [157336] // Interestellar

describe('get user watched genres', () => {
  beforeEach(() => {
    ;(tmdb.movies.details as Mock).mockResolvedValue({
      id: 157336,
      title: 'Interstellar',
      overview: '',
      poster_path: '/poster.jpg',
      backdrop_path: '/backdrop.jpg',
      release_date: '2014-11-05',
      genres: [
        { id: 878, name: 'Science Fiction' },
        { id: 18, name: 'Drama' },
      ],
    })
  })

  it('should be able to get user watched genres with right values', async () => {
    const user = await makeUser()

    for (const movieId of SCIENCE_FICTION_MOVIES) {
      await makeUserItem({
        userId: user.id,
        mediaType: 'MOVIE',
        status: 'WATCHED',
        tmdbId: movieId,
      })
    }

    const sut = await getUserWatchedGenresService({
      userId: user.id,
      redis: redisClient,
      language: 'en-US',
    })

    expect(sut).toEqual({
      genres: expect.arrayContaining([
        expect.objectContaining({
          count: SCIENCE_FICTION_MOVIES.length,
          percentage: 100,
        }),
      ]),
    })
  })
})
