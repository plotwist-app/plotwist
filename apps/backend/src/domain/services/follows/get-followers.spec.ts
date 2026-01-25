import { beforeAll, describe, expect, it } from 'vitest'
import type { User } from '@/domain/entities/user'
import { makeFollow } from '@/test/factories/make-follow'
import { makeUser } from '@/test/factories/make-user'
import { getFollowersService } from './get-followers'

let user: User
let followers: User[]

describe('get followers service', () => {
  beforeAll(async () => {
    user = await makeUser()

    followers = await Promise.all(
      Array.from({ length: 15 }).map(() => makeUser())
    )

    for (const follower of followers) {
      await makeFollow({
        followerId: follower.id,
        followedId: user.id,
      })
    }
  })

  it('should return the first page of followers', async () => {
    const pageSize = 10

    const result = await getFollowersService({
      followedId: user.id,
      pageSize,
    })

    expect(result.followers).toHaveLength(pageSize)
    expect(result.nextCursor).not.toBeNull()
  })

  it('should return the second page of followers', async () => {
    const pageSize = 10

    const firstPage = await getFollowersService({
      followedId: user.id,
      pageSize,
    })

    const secondPage = await getFollowersService({
      followedId: user.id,
      pageSize,
      // biome-ignore lint/style/noNonNullAssertion: Here will be the next cursor
      cursor: firstPage.nextCursor!,
    })

    expect(secondPage.followers).toHaveLength(5)
    expect(secondPage.nextCursor).toBeNull()
  })

  it('should return no followers when there are none', async () => {
    const emptyUser = await makeUser()

    const result = await getFollowersService({
      followedId: emptyUser.id,
      pageSize: 10,
    })

    expect(result.followers).toHaveLength(0)
    expect(result.nextCursor).toBeNull()
  })
})
