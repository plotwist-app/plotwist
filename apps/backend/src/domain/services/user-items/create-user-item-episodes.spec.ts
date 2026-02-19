import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  type Mock,
  vi,
} from 'vitest'
import type { User } from '@/domain/entities/user'
import type { UserItem } from '@/domain/entities/user-item'
import { tmdb } from '@/infra/adapters/tmdb'
import { makeUser } from '@/test/factories/make-user'
import { makeUserItem } from '@/test/factories/make-user-item'
import { redisClient } from '@/test/mocks/redis'
import { createUserItemEpisodesService } from './create-user-item-episodes'

vi.mock('@/infra/adapters/tmdb', () => ({
  tmdb: {
    tv: {
      details: vi.fn(),
    },
    season: {
      details: vi.fn(),
    },
  },
}))

const CHERNOBYL_TMDB_ID = 87108

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

let user: User
let userItem: UserItem

describe('create user item episodes', () => {
  beforeEach(() => {
    ;(tmdb.tv.details as Mock).mockResolvedValue({
      id: CHERNOBYL_TMDB_ID,
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

  beforeAll(async () => {
    user = await makeUser()
    userItem = await makeUserItem({
      userId: user.id,
      tmdbId: CHERNOBYL_TMDB_ID,
      mediaType: 'TV_SHOW',
    })
  })

  it('should be able to create user item episodes', async () => {
    const sut = await createUserItemEpisodesService({
      redis: redisClient,
      tmdbId: userItem.tmdbId,
      userId: user.id,
    })

    expect(sut?.userEpisodes).toHaveLength(5)
  })
})
