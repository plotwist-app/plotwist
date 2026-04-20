import { config } from '@/config'
import type { EmailMessage } from '@/domain/entities/email-message'
import { emailServiceFactory } from '@/infra/factories/resend-factory'

type SendPasswordResetEmailServiceInput = {
  email: string
  token: string
}

export async function sendPasswordResetEmailService({
  email,
  token,
}: SendPasswordResetEmailServiceInput) {
  const link = `${config.app.CLIENT_URL}/reset-password?token=${token}`

  const html = `Click the link to reset your password: <a href="${link}">Reset password</a>`
  const subject = 'Reset your Plotwist password'

  const emailService = emailServiceFactory('Resend')

  const emailMessage: EmailMessage = {
    to: [email],
    subject,
    html,
  }

  await emailService.sendEmail(emailMessage)
}
