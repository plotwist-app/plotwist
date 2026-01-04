import { beforeAll, describe, expect, it } from 'vitest'

import type { List } from '@/domain/entities/lists'
import type { User } from '@/domain/entities/user'
import { makeList } from '@/test/factories/make-list'
import { makeListItem } from '@/test/factories/make-list-item'
import { makeUser } from '@/test/factories/make-user'
import { updateListItemsService } from './update-list-items'

let list: List
let user: User

describe('update list items service', () => {
  beforeAll(async () => {
    user = await makeUser()
    list = await makeList({ userId: user.id })
  })

  it('should be able to update list items positions', async () => {
    const listItem1 = await makeListItem({ listId: list.id, position: 1 })
    const listItem2 = await makeListItem({ listId: list.id, position: 2 })

    const input = {
      listItems: [
        { id: listItem1.id, position: 2 },
        { id: listItem2.id, position: 1 },
      ],
    }

    const sut = await updateListItemsService(input)

    expect(sut.listItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: listItem1.id, position: 2 }),
        expect.objectContaining({ id: listItem2.id, position: 1 }),
      ])
    )
  })
})
