import { describe, expect, it } from 'vitest'

import { makeUser } from '@/test/factories/make-user'
import { UserNotFoundError } from '../../errors/user-not-found'
import { getUserByUsername } from './get-user-by-username'

describe('get user by username email', () => {
  it('should be able to get user by username', async () => {
    const { username, email } = await makeUser()
    const sut = await getUserByUsername({ username })

    expect(sut).toEqual({
      user: expect.objectContaining({
        email,
      }),
    })
  })

  it('should be able to get user by username even if it is uppercase', async () => {
    const { username, email } = await makeUser()
    const sut = await getUserByUsername({ username: username.toUpperCase() })

    expect(sut).toEqual({
      user: expect.objectContaining({
        email,
      }),
    })
  })

  it('should not be able to get user with non-existent username', async () => {
    const sut = await getUserByUsername({ username: 'non-existent' })

    expect(sut).toBeInstanceOf(UserNotFoundError)
  })
})
