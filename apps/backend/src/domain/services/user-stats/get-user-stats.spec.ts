import { makeUser } from '@/test/factories/make-user'
import { makeUserItem } from '@/test/factories/make-user-item'
import { getUserStatsService } from './get-user-stats'

describe('get user stats', () => {
  it('should be able to get user stats', async () => {
    const user = await makeUser()

    await makeUserItem({ userId: user.id, status: 'WATCHED' })
    await makeUserItem({ userId: user.id, status: 'WATCHED' })

    const sut = await getUserStatsService(user.id)

    expect(sut).toEqual({
      userStats: expect.objectContaining({
        followersCount: 0,
        followingCount: 0,
        watchedMoviesCount: 2,
        watchedSeriesCount: 0,
      }),
    })
  })
})
