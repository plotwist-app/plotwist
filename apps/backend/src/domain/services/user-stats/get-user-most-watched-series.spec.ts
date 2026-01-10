import { makeUser } from '@/test/factories/make-user'
import { makeUserItem } from '@/test/factories/make-user-item'
import { redisClient } from '@/test/mocks/redis'
import { createUserItemEpisodesService } from '../user-items/create-user-item-episodes'
import { getUserMostWatchedSeriesService } from './get-user-most-watched-series'

const CHERNOBYL = {
  tmdbId: 87108,
  mediaType: 'TV_SHOW',
  episodes: 5,
} as const

describe('get user most watched series', () => {
  it('should be able to get most watched series', async () => {
    const user = await makeUser()

    await makeUserItem({
      userId: user.id,
      tmdbId: CHERNOBYL.tmdbId,
      mediaType: CHERNOBYL.mediaType,
    })

    await createUserItemEpisodesService({
      redis: redisClient,
      tmdbId: CHERNOBYL.tmdbId,
      userId: user.id,
    })

    const sut = await getUserMostWatchedSeriesService({
      userId: user.id,
      redis: redisClient,
      language: 'en-US',
    })

    expect(sut).toEqual({
      mostWatchedSeries: expect.arrayContaining([
        expect.objectContaining({
          id: CHERNOBYL.tmdbId,
          episodes: CHERNOBYL.episodes,
        }),
      ]),
    })
  })
})
