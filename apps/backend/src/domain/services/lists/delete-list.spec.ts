import { beforeAll, describe, expect, it } from 'vitest'

import type { User } from '@/domain/entities/user'
import { makeList } from '@/test/factories/make-list'
import { makeUser } from '@/test/factories/make-user'
import { deleteListService } from './delete-list'

let user: User

describe('delete list', () => {
  beforeAll(async () => {
    user = await makeUser()
  })

  it('should be able to delete a list', async () => {
    const list = await makeList({ userId: user.id })
    const sut = await deleteListService({ id: list.id, userId: user.id })

    expect(sut).toBeTruthy()
  })
})
