import { config } from '@/config'
import type { EmailMessage } from '@/domain/entities/email-message'
import { emailServiceFactory } from '@/infra/factories/resend-factory'

type SendMagicLinkEmailServiceInput = {
  email: string
  token: string
  url?: string
}

export async function sendMagicLinkEmailService({
  email,
  token,
  url: _url,
}: SendMagicLinkEmailServiceInput) {
  const link = `${config.app.CLIENT_URL}/reset-password?token=${token}`

  const html = `Please use the following link to login and set your new password: <a href="${link}">Login</a>`
  const subject = 'Login to Your Account'

  const to = [email]

  const emailService = emailServiceFactory('Resend')

  const emailMessage: EmailMessage = {
    to,
    subject,
    html,
  }

  await emailService.sendEmail(emailMessage)
}
