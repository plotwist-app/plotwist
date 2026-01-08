import { beforeAll, describe, expect, it } from 'vitest'

import { makeList } from '@/test/factories/make-list'
import { makeUser } from '@/test/factories/make-user'
import { faker } from '@faker-js/faker'
import { ListNotFoundError } from '../../errors/list-not-found-error'
import { getListService } from './get-list'

import type { User } from '@/domain/entities/user'

let user: User

describe('get list', () => {
  beforeAll(async () => {
    user = await makeUser()
  })

  it('should be able to get a list', async () => {
    const list = await makeList({ userId: user.id })
    const sut = await getListService({
      id: list.id,
    })

    expect(sut).toEqual({
      list: expect.objectContaining({
        title: list.title,
      }),
    })
  })

  it('should not be able able to get a inexistent list', async () => {
    const sut = await getListService({
      id: faker.string.uuid(),
    })

    expect(sut).toBeInstanceOf(ListNotFoundError)
  })
})
