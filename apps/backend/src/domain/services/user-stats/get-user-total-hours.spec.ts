import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { tmdb } from '@/adapters/tmdb'
import { makeUser } from '@/test/factories/make-user'
import { makeUserItem } from '@/test/factories/make-user-item'
import { redisClient } from '@/test/mocks/redis'
import { createUserItemEpisodesService } from '../user-items/create-user-item-episodes'
import { getUserTotalHoursService } from './get-user-total-hours'

vi.mock('@/adapters/tmdb', () => ({
  tmdb: {
    tv: {
      details: vi.fn(),
    },
    movies: {
      details: vi.fn(),
    },
    season: {
      details: vi.fn(),
    },
  },
}))

const CHERNOBYL = {
  tmdbId: 87108,
  mediaType: 'TV_SHOW',
  runtime: 5.516666666666667,
} as const

const INCEPTION = {
  tmdbId: 27205,
  mediaType: 'MOVIE',
  runtime: 148 / 60,
} as const

const mockSeasons = [
  {
    id: 114355,
    name: 'Season 1',
    overview: '',
    poster_path: '/poster.jpg',
    season_number: 1,
    episode_count: 5,
    air_date: '2019-05-06',
    vote_average: 9.4,
  },
]

const mockEpisodes = Array.from({ length: 5 }, (_, i) => ({
  id: 1000000 + i,
  name: `Episode ${i + 1}`,
  overview: '',
  air_date: '2019-05-06',
  episode_number: i + 1,
  season_number: 1,
  // CHERNOBYL total runtime: 331 minutes (5.516666666666667 hours)
  // 331 / 5 = 66.2 minutes per episode
  // Using 66 minutes for 4 episodes and 67 for 1 episode = 331 minutes total
  runtime: i < 4 ? 66 : 67,
  vote_average: 9.5,
}))

describe('get user total hours count', () => {
  beforeEach(() => {
    ;(tmdb.tv.details as Mock).mockImplementation((tmdbId: number) => {
      if (tmdbId === CHERNOBYL.tmdbId) {
        return Promise.resolve({
          id: CHERNOBYL.tmdbId,
          name: 'Chernobyl',
          overview: '',
          poster_path: '/poster.jpg',
          backdrop_path: '/backdrop.jpg',
          first_air_date: '2019-05-06',
          seasons: mockSeasons,
        })
      }
      return Promise.resolve({})
    })

    ;(tmdb.movies.details as Mock).mockImplementation((tmdbId: number) => {
      if (tmdbId === INCEPTION.tmdbId) {
        return Promise.resolve({
          id: INCEPTION.tmdbId,
          title: 'Inception',
          overview: '',
          poster_path: '/poster.jpg',
          backdrop_path: '/backdrop.jpg',
          release_date: '2010-07-16',
          runtime: 148,
        })
      }
      return Promise.resolve({})
    })

    ;(tmdb.season.details as Mock).mockResolvedValue({
      id: 114355,
      name: 'Season 1',
      overview: '',
      poster_path: '/poster.jpg',
      season_number: 1,
      episodes: mockEpisodes,
    })
  })

  it('should be able to get reviews count', async () => {
    const user = await makeUser()

    const userItem = await makeUserItem({
      userId: user.id,
      tmdbId: CHERNOBYL.tmdbId,
      mediaType: CHERNOBYL.mediaType,
      status: 'WATCHED',
    })

    await makeUserItem({
      userId: user.id,
      tmdbId: INCEPTION.tmdbId,
      mediaType: INCEPTION.mediaType,
      status: 'WATCHED',
    })

    await createUserItemEpisodesService({
      redis: redisClient,
      tmdbId: userItem.tmdbId,
      userId: user.id,
    })

    const sut = await getUserTotalHoursService(user.id, redisClient)

    expect(sut).toEqual({
      totalHours: CHERNOBYL.runtime + INCEPTION.runtime,
    })
  })
})
