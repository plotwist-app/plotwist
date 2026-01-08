import { makeUser } from '@/test/factories/make-user'
import { makeRawUserItem, makeUserItem } from '@/test/factories/make-user-item'
import { beforeAll, describe, expect, it } from 'vitest'

import type { User } from '@/domain/entities/user'
import { upsertUserItemService } from './upsert-user-item'

let user: User

describe('upsert user item', () => {
  beforeAll(async () => {
    user = await makeUser()
  })

  it('should be able to insert user item', async () => {
    const insertUserItem = makeRawUserItem({ userId: user.id })
    const sut = await upsertUserItemService(insertUserItem)

    expect(sut).toEqual({
      userItem: expect.objectContaining(insertUserItem),
    })
  })

  it('should be able to update user item', async () => {
    const { updatedAt, ...userItem } = await makeUserItem({ userId: user.id })
    const sut = await upsertUserItemService(userItem)

    expect(sut).toEqual({
      userItem: expect.objectContaining(userItem),
    })
  })
})
