import { faker } from '@faker-js/faker'
import { beforeAll, describe, expect, it } from 'vitest'
import type { List } from '@/domain/entities/lists'
import type { User } from '@/domain/entities/user'
import { makeList } from '@/test/factories/make-list'
import { makeUser } from '@/test/factories/make-user'
import { ListNotFoundError } from '../../errors/list-not-found-error'
import { updateListBannerService } from './update-list-banner'

let user: User
let list: List

describe('update list banner', () => {
  beforeAll(async () => {
    user = await makeUser()
    list = await makeList({ userId: user.id })
  })

  it('should be able to update list banner', async () => {
    const sut = await updateListBannerService({
      listId: list.id,
      userId: user.id,
      bannerUrl: 'new',
    })

    expect(sut).toEqual({
      list: expect.objectContaining({
        bannerUrl: 'new',
      }),
    })
  })

  it('should not be able to update banner of a inexistent list', async () => {
    const sut = await updateListBannerService({
      listId: faker.string.uuid(),
      userId: user.id,
      bannerUrl: 'new',
    })

    expect(sut).toBeInstanceOf(ListNotFoundError)
  })
})
