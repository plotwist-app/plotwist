import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'
import { tmdb } from '@/infra/adapters/tmdb'
import { makeUser } from '@/test/factories/make-user'
import { makeUserItem } from '@/test/factories/make-user-item'
import { redisClient } from '@/test/mocks/redis'
import { createUserItemEpisodesService } from '../user-items/create-user-item-episodes'
import { getUserMostWatchedSeriesService } from './get-user-most-watched-series'

vi.mock('@/adapters/tmdb', () => ({
  tmdb: {
    tv: {
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
  episodes: 5,
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
  runtime: 60,
  vote_average: 9.5,
}))

describe('get user most watched series', () => {
  beforeEach(() => {
    ;(tmdb.tv.details as Mock).mockResolvedValue({
      id: CHERNOBYL.tmdbId,
      name: 'Chernobyl',
      overview: '',
      poster_path: '/poster.jpg',
      backdrop_path: '/backdrop.jpg',
      first_air_date: '2019-05-06',
      seasons: mockSeasons,
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
