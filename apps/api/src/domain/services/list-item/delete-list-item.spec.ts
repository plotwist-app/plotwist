import { beforeAll, describe, expect, it } from 'vitest'

import { ListItemNotFoundError } from '@/domain/errors/list-item-not-found-error'
import { makeList } from '@/test/factories/make-list'
import { makeListItem } from '@/test/factories/make-list-item'
import { makeUser } from '@/test/factories/make-user'
import { faker } from '@faker-js/faker'
import { deleteListItemService } from './delete-list-item'

import type { List } from '@/domain/entities/lists'
import type { User } from '@/domain/entities/user'

let list: List
let user: User

describe('delete list item', () => {
  beforeAll(async () => {
    user = await makeUser()
    list = await makeList({ userId: user.id })
  })

  it('should be able to delete a list item', async () => {
    const listItem = await makeListItem({ listId: list.id })
    const sut = await deleteListItemService({
      id: listItem.id,
      userId: user.id,
    })

    expect(sut).toBeTruthy()
  })

  it('should not be able to delete list item with invalid id', async () => {
    const sut = await deleteListItemService({
      id: faker.string.uuid(),
      userId: user.id,
    })

    expect(sut).toBeInstanceOf(ListItemNotFoundError)
  })
})
