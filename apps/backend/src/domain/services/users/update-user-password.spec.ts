import { faker } from '@faker-js/faker'
import { describe, expect, it } from 'vitest'
import { InvalidTokenError } from '@/domain/errors/invalid-token-error'
import { makeMagicToken } from '@/test/factories/make-magic-token'
import { makeUser } from '@/test/factories/make-user'
import { updatePasswordService } from './update-user-password'

describe('updateUserPassword', () => {
  it('should update the password with a valid token', async () => {
    const user = await makeUser()
    const { token } = await makeMagicToken(user.id)
    const newPassword = faker.internet.password()

    const result = await updatePasswordService({ password: newPassword, token })

    expect(result).toEqual({ status: 'password_set' })
  })

  it('should return InvalidTokenError for a non-existent token', async () => {
    const result = await updatePasswordService({
      password: faker.internet.password(),
      token: 'non-existent-token',
    })

    expect(result).toBeInstanceOf(InvalidTokenError)
  })

  it('should return InvalidTokenError for an already-used token', async () => {
    const user = await makeUser()
    const { token } = await makeMagicToken(user.id, { used: true })

    const result = await updatePasswordService({
      password: faker.internet.password(),
      token,
    })

    expect(result).toBeInstanceOf(InvalidTokenError)
  })

  it('should return InvalidTokenError for an expired token', async () => {
    const user = await makeUser()
    const { token } = await makeMagicToken(user.id, {
      expiresAt: new Date(Date.now() - 1000),
    })

    const result = await updatePasswordService({
      password: faker.internet.password(),
      token,
    })

    expect(result).toBeInstanceOf(InvalidTokenError)
  })
})
