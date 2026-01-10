import { config } from '@/config'
import type { EmailMessage } from '@/domain/entities/email-message'
import type { EmailService } from '@/ports/email-service'
import { Resend } from 'resend'

const resend = new Resend(config.services.RESEND_API_KEY)

async function sendEmail(emailMessage: EmailMessage) {
  await resend.emails.send({
    from: 'Plotwist <dev@plotwist.app>',
    to: emailMessage.to,
    subject: emailMessage.subject,
    html: emailMessage.html,
  })
}

const ResendAdapter: EmailService = {
  sendEmail: emailMessage => sendEmail(emailMessage),
}

export { ResendAdapter }
