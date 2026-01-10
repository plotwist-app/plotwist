import type { User } from '@/domain/entities/user'
import { makeUser } from '@/test/factories/make-user'
import { makeUserEpisode } from '@/test/factories/make-user-episode'
import { beforeAll, describe, expect, it } from 'vitest'
import { getUserEpisodesService } from './get-user-episodes'

const TMDB_ID = 1396
let user: User

describe('get user episodes', () => {
  beforeAll(async () => {
    user = await makeUser()

    await makeUserEpisode({ userId: user.id, tmdbId: TMDB_ID })
  })

  it('should be able to get user episodes', async () => {
    const sut = await getUserEpisodesService({
      tmdbId: TMDB_ID,
      userId: user.id,
    })

    expect(sut.userEpisodes).toHaveLength(1)
  })
})
