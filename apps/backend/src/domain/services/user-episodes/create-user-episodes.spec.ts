import { beforeAll, describe, expect, it } from 'vitest'
import type { User } from '@/domain/entities/user'
import { makeUser } from '@/test/factories/make-user'
import { makeRawUserEpisode } from '@/test/factories/make-user-episode'
import { createUserEpisodesService } from './create-user-episodes'

let user: User

describe('create user episode', () => {
  beforeAll(async () => {
    user = await makeUser()
  })

  it('should be able to create a user episode', async () => {
    const userEpisode = makeRawUserEpisode({ userId: user.id })
    const sut = await createUserEpisodesService([userEpisode])

    expect(sut).toEqual({
      userEpisodes: expect.arrayContaining([
        expect.objectContaining(userEpisode),
      ]),
    })
  })

  it('should be able to create multiple user episodes', async () => {
    const [firstUserEpisode, secondUserEpisode, thirtyUserEpisode] = [
      makeRawUserEpisode({ userId: user.id }),
      makeRawUserEpisode({ userId: user.id }),
      makeRawUserEpisode({ userId: user.id }),
    ]

    const sut = await createUserEpisodesService([
      firstUserEpisode,
      secondUserEpisode,
      thirtyUserEpisode,
    ])

    expect(sut).toEqual({
      userEpisodes: expect.arrayContaining([
        expect.objectContaining(firstUserEpisode),
        expect.objectContaining(secondUserEpisode),
        expect.objectContaining(thirtyUserEpisode),
      ]),
    })
  })
})
