import { beforeAll, describe, expect, it } from 'vitest'
import type { User } from '@/domain/entities/user'
import type { UserItem } from '@/domain/entities/user-item'
import { makeUser } from '@/test/factories/make-user'
import { makeUserEpisode } from '@/test/factories/make-user-episode'
import { makeUserItem } from '@/test/factories/make-user-item'
import { getUserEpisodesService } from '../user-episodes/get-user-episodes'
import { deleteUserItemEpisodesService } from './delete-user-item-episodes'

let user: User
let userItem: UserItem

describe('delete user item episodes', () => {
  beforeAll(async () => {
    user = await makeUser()
    userItem = await makeUserItem({ userId: user.id })
  })

  it('should be able to delete user item episodes', async () => {
    for (let idx = 0; idx < 5; idx++) {
      await makeUserEpisode({
        userId: user.id,
        tmdbId: userItem.tmdbId,
        episodeNumber: idx,
        seasonNumber: 1,
      })
    }

    await deleteUserItemEpisodesService({
      tmdbId: userItem.tmdbId,
      userId: user.id,
    })

    const sut = await getUserEpisodesService({
      userId: user.id,
      tmdbId: userItem.tmdbId,
    })

    expect(sut.userEpisodes).toHaveLength(0)
  })
})
