import { describe, expect, it } from 'vitest'

import { makeRawUser, makeUser } from '@/test/factories/make-user'
import { hashPassword } from '@/utils/password'
import { faker } from '@faker-js/faker'

import { InvalidCredentialsError } from '@/domain/errors/invalid-credentials-error'
import { loginService } from './login'

describe('login', () => {
  it('should be able to login', async () => {
    const password = faker.internet.password()
    const hashedPassword = await hashPassword(password)

    const user = await makeUser({ password: hashedPassword })
    const sut = await loginService({ login: user.email, password })

    expect(sut).toBeTruthy()
    expect(sut).toEqual({
      user: expect.objectContaining({
        email: user.email,
      }),
    })
  })

  it('should be able to login with username', async () => {
    const password = faker.internet.password()
    const hashedPassword = await hashPassword(password)

    const user = await makeUser({ password: hashedPassword })
    const sut = await loginService({ login: user.username, password })

    expect(sut).toBeTruthy()
    expect(sut).toEqual({
      user: expect.objectContaining({
        username: user.username,
      }),
    })
  })

  it('should be able to login with username in lowercase', async () => {
    const password = faker.internet.password()
    const hashedPassword = await hashPassword(password)

    const user = await makeUser({ password: hashedPassword })
    const sut = await loginService({
      login: user.username.toLowerCase(),
      password,
    })

    expect(sut).toBeTruthy()
    expect(sut).toEqual({
      user: expect.objectContaining({
        username: user.username,
      }),
    })
  })

  it('should be able to login with username in uppercase', async () => {
    const password = faker.internet.password()
    const hashedPassword = await hashPassword(password)

    const user = await makeUser({ password: hashedPassword })

    const sut = await loginService({
      login: user.username.toUpperCase(),
      password,
    })

    expect(sut).toBeTruthy()
    expect(sut).toEqual({
      user: expect.objectContaining({
        username: user.username,
      }),
    })
  })

  it('should not be able to login with non-existent user', async () => {
    const user = makeRawUser()
    const sut = await loginService({
      login: user.email,
      password: user.password,
    })

    expect(sut).toBeInstanceOf(InvalidCredentialsError)
  })

  it('should not be able to login with invalid credentials', async () => {
    const sut = await loginService({
      login: 'invalid@email.com',
      password: 'invalid password',
    })

    expect(sut).toBeInstanceOf(InvalidCredentialsError)
  })
})
