import { makeUser } from '@/test/factories/make-user'
import { makeUserItem } from '@/test/factories/make-user-item'
import { getUserItemsStatusService } from './get-user-items-status'

describe('get user items status', () => {
  it('should be able to get items status', async () => {
    const user = await makeUser()

    await makeUserItem({
      userId: user.id,
      status: 'WATCHED',
    })

    await makeUserItem({
      userId: user.id,
      status: 'WATCHING',
    })

    await makeUserItem({
      userId: user.id,
      status: 'WATCHLIST',
    })

    const sut = await getUserItemsStatusService({
      userId: user.id,
    })

    expect(sut).toEqual({
      userItems: expect.arrayContaining([
        expect.objectContaining({
          status: 'WATCHED',
          count: 1,
        }),
        expect.objectContaining({
          status: 'WATCHING',
          count: 1,
        }),
        expect.objectContaining({
          status: 'WATCHLIST',
          count: 1,
        }),
      ]),
    })
  })
})
