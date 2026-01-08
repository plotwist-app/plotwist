import { beforeAll, describe, expect, it } from 'vitest'

import { makeUser } from '@/test/factories/make-user'

import { randomUUID } from 'node:crypto'
import type { User } from '@/domain/entities/user'
import { makeFollow } from '@/test/factories/make-follow'
import { getFollowService } from './get-follow'

let follower: User
let followed: User

describe('get follow', () => {
  beforeAll(async () => {
    follower = await makeUser()
    followed = await makeUser()
  })

  it('should return the follow if it exists', async () => {
    await makeFollow({
      followedId: followed.id,
      followerId: follower.id,
    })

    const sut = await getFollowService({
      followedId: followed.id,
      followerId: follower.id,
    })

    expect(sut).toEqual({
      follow: expect.objectContaining({
        followerId: follower.id,
        followedId: followed.id,
      }),
    })
  })

  it('should return null if the follow does not exist', async () => {
    const sut = await getFollowService({
      followedId: followed.id,
      followerId: randomUUID(),
    })

    expect(sut).toEqual({
      follow: null,
    })
  })
})
