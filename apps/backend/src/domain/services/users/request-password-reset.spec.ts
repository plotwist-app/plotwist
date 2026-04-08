import { faker } from '@faker-js/faker'
import { describe, expect, it, vi } from 'vitest'
import { makeUser } from '@/test/factories/make-user'
import { requestPasswordResetService } from './request-password-reset'
import * as sendPasswordResetEmail from './send-password-reset-email'

describe('requestPasswordReset', () => {
  it('should return generic response and send email when user exists', async () => {
    const user = await makeUser()
    const sendEmailSpy = vi
      .spyOn(sendPasswordResetEmail, 'sendPasswordResetEmailService')
      .mockResolvedValueOnce(undefined)

    const result = await requestPasswordResetService({ login: user.email })

    expect(result).toEqual({ status: 'password_reset_email_sent' })
    expect(sendEmailSpy).toHaveBeenCalledOnce()
    expect(sendEmailSpy).toHaveBeenCalledWith(
      expect.objectContaining({ email: user.email })
    )
  })

  it('should return same generic response when user does not exist', async () => {
    const sendEmailSpy = vi.spyOn(
      sendPasswordResetEmail,
      'sendPasswordResetEmailService'
    )

    const result = await requestPasswordResetService({
      login: faker.internet.email(),
    })

    expect(result).toEqual({ status: 'password_reset_email_sent' })
    expect(sendEmailSpy).not.toHaveBeenCalled()
  })
})
