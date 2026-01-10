import { describe, expect, it } from 'vitest'

import { makeList } from '@/test/factories/make-list'
import { makeUser } from '@/test/factories/make-user'
import { getListsServices } from './get-lists'

describe('get lists', () => {
  it('should be able to get lists by user id ', async () => {
    const user = await makeUser()

    const firstList = await makeList({ userId: user.id })
    const secondList = await makeList({ userId: user.id })

    const sut = await getListsServices({ userId: user.id })

    expect(sut).toEqual({
      lists: expect.arrayContaining([
        expect.objectContaining({ id: firstList.id }),
        expect.objectContaining({ id: secondList.id }),
      ]),
    })
  })
})
