import { beforeAll, describe, expect, it } from 'vitest'
import type { User } from '@/domain/entities/user'
import type { UserItem } from '@/domain/entities/user-item'
import { makeUser } from '@/test/factories/make-user'
import { makeUserItem } from '@/test/factories/make-user-item'
import { redisClient } from '@/test/mocks/redis'
import { createUserItemEpisodesService } from './create-user-item-episodes'

let user: User
let userItem: UserItem

describe('create user item episodes', () => {
  beforeAll(async () => {
    user = await makeUser()
    userItem = await makeUserItem({
      userId: user.id,
      tmdbId: 87108,
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
