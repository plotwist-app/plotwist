import { faker } from '@faker-js/faker'
import { beforeAll, describe, expect, it } from 'vitest'

import type { User } from '@/domain/entities/user'
import { makeUser } from '@/test/factories/make-user'
import { updateUserService } from './update-user'

let user: User

describe('update user', () => {
  beforeAll(async () => {
    user = await makeUser()
  })

  it('should be able to update user username', async () => {
    const username = faker.internet.username()

    const sut = await updateUserService({
      userId: user.id,
      username: username,
    })

    expect(sut).toEqual({
      user: expect.objectContaining({
        username: username,
      }),
    })
  })

  it('should be able to update user banner url', async () => {
    const bannerUrl = faker.internet.url()
    const sut = await updateUserService({
      userId: user.id,
      bannerUrl: bannerUrl,
    })

    expect(sut).toEqual({
      user: expect.objectContaining({
        bannerUrl: bannerUrl,
      }),
    })
  })

  it('should be able to update user image url', async () => {
    const avatarUrl = faker.internet.url()

    const sut = await updateUserService({
      userId: user.id,
      avatarUrl: avatarUrl,
    })

    expect(sut).toEqual({
      user: expect.objectContaining({
        avatarUrl: avatarUrl,
      }),
    })
  })
})
