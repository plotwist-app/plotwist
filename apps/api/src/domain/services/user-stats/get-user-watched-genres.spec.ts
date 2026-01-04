import { makeUser } from '@/test/factories/make-user'

import { makeUserItem } from '@/test/factories/make-user-item'
import { redisClient } from '@/test/mocks/redis'
import { getUserWatchedGenresService } from './get-user-watched-genres'

const SCIENCE_FICTION_MOVIES = [157336] // Interestellar

describe('get user watched genres', () => {
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
