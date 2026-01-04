import { beforeAll, describe, expect, it } from 'vitest'

import { makeList } from '@/test/factories/make-list'
import { makeUser } from '@/test/factories/make-user'
import { updateListService } from './update-list'

import type { List } from '@/domain/entities/lists'
import type { User } from '@/domain/entities/user'

let user: User
let list: List

describe('update list', () => {
  beforeAll(async () => {
    user = await makeUser()
    list = await makeList({ userId: user.id })
  })

  it('should be able to update a list', async () => {
    const sut = await updateListService({
      id: list.id,
      userId: user.id,
      values: {
        ...list,
        title: 'new title',
      },
    })

    expect(sut).toEqual({
      list: expect.objectContaining({
        title: 'new title',
      }),
    })
  })
})
