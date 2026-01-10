import { describe, expect, it, vi } from 'vitest'

import { makeRawUser, makeUser } from '@/test/factories/make-user'
import { createUser } from './create-user'

import * as password from '@/utils/password'
import { EmailOrUsernameAlreadyRegisteredError } from '../../errors/email-or-username-already-registered-error'
import { HashPasswordError } from '../../errors/hash-password-error'

describe('create user', () => {
  it('should be able to create a user', async () => {
    const user = makeRawUser()
    const sut = await createUser(user)

    expect(sut).toEqual({
      user: expect.objectContaining({
        email: user.email,
      }),
    })
  })

  it('should not be able to create a user with email already registered', async () => {
    const user = await makeUser()
    const sut = await createUser(user)

    expect(sut).toBeInstanceOf(EmailOrUsernameAlreadyRegisteredError)
  })

  it('should not be able to  a user with username already created', async () => {
    const user = await makeUser()
    const sut = await createUser(user)

    expect(sut).toBeInstanceOf(EmailOrUsernameAlreadyRegisteredError)
  })

  it('should handle hash password error', async () => {
    vi.spyOn(password, 'hashPassword').mockRejectedValueOnce(() => {
      return new HashPasswordError()
    })

    const user = makeRawUser()
    const sut = await createUser(user)

    expect(sut).toBeInstanceOf(HashPasswordError)
  })
})
