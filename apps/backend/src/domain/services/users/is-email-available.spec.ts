import { describe, expect, it } from 'vitest'

import { faker } from '@faker-js/faker'

import { makeUser } from '@/test/factories/make-user'
import { EmailAlreadyRegisteredError } from '../../errors/email-already-registered'
import { isEmailAvailable } from './is-email-available'

describe('check email', () => {
  it('should be able to check available email', async () => {
    const email = faker.internet.email()
    const sut = await isEmailAvailable({ email })

    expect(sut).toEqual({
      available: true,
    })
  })

  it('should be able to check unavailable email', async () => {
    const user = await makeUser()
    const sut = await isEmailAvailable({ email: user.email })

    expect(sut).toBeInstanceOf(EmailAlreadyRegisteredError)
  })
})
