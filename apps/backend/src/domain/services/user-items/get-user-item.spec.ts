import { beforeAll, describe, expect, it } from 'vitest'
import type { User } from '@/domain/entities/user'
import type { UserItem } from '@/domain/entities/user-item'
import { makeUser } from '@/test/factories/make-user'
import { makeUserItem } from '@/test/factories/make-user-item'
import { getUserItemService } from './get-user-item'

let user: User
let userItem: UserItem

describe('get user item', () => {
  beforeAll(async () => {
    user = await makeUser()
    userItem = await makeUserItem({ userId: user.id, status: 'WATCHED' })
  })

  it('should be able to get user item', async () => {
    const sut = await getUserItemService({
      mediaType: userItem.mediaType,
      tmdbId: userItem.tmdbId,
      userId: user.id,
    })

    expect(sut).toEqual({
      userItem: expect.objectContaining({
        id: userItem.id,
        tmdbId: userItem.tmdbId,
      }),
    })
  })
})
