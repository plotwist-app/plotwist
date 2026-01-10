import { beforeAll, describe, expect, it } from 'vitest'
import type { User } from '@/domain/entities/user'
import { makeFollow } from '@/test/factories/make-follow'
import { makeUser } from '@/test/factories/make-user'
import { deleteFollowService } from './delete-follow'

let follower: User
let followed: User

describe('delete follow', () => {
  beforeAll(async () => {
    follower = await makeUser()
    followed = await makeUser()
  })

  it('should be able to delete a follow', async () => {
    await makeFollow({
      followedId: followed.id,
      followerId: follower.id,
    })

    const sut = await deleteFollowService({
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
})
