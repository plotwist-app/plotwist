import { beforeAll, describe, expect, it } from 'vitest'
import type { User } from '@/domain/entities/user'
import { FollowAlreadyRegisteredError } from '@/domain/errors/follow-already-registered'
import { makeUser } from '@/test/factories/make-user'
import { createFollowService } from './create-follow'

let follower: User
let followed: User

describe('create follow', () => {
  beforeAll(async () => {
    follower = await makeUser()
    followed = await makeUser()
  })

  it('should be able to follow', async () => {
    const sut = await createFollowService({
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

  it('should not be able to follow twice', async () => {
    const sut = await createFollowService({
      followedId: followed.id,
      followerId: follower.id,
    })

    expect(sut).toBeInstanceOf(FollowAlreadyRegisteredError)
  })
})
