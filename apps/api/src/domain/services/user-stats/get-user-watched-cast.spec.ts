import { makeUser } from '@/test/factories/make-user'

import { makeUserItem } from '@/test/factories/make-user-item'
import { redisClient } from '@/test/mocks/redis'
import { getUserWatchedCastService } from './get-user-watched-cast'

const ADAM_SANDLER_MOVIES = [9339, 1824] // Click, 50 First Dates

describe('get user watched cast', () => {
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
