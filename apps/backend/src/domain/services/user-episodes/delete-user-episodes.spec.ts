import { beforeAll, describe, expect, it } from 'vitest'
import type { User } from '@/domain/entities/user'
import type { UserEpisode } from '@/domain/entities/user-episode'
import { makeUser } from '@/test/factories/make-user'
import { makeUserEpisode } from '@/test/factories/make-user-episode'
import { deleteUserEpisodesService } from './delete-user-episodes'
import { getUserEpisodesService } from './get-user-episodes'

const TMDB_ID = 1396

let user: User
let userEpisode: UserEpisode

describe('delete user episode', () => {
  beforeAll(async () => {
    user = await makeUser()
    userEpisode = await makeUserEpisode({ userId: user.id, tmdbId: TMDB_ID })
  })

  it('should be able to get delete user episode', async () => {
    await deleteUserEpisodesService([userEpisode.id])
    const sut = await getUserEpisodesService({
      userId: user.id,
      tmdbId: TMDB_ID,
    })

    expect(sut.userEpisodes).toHaveLength(0)
  })
})
