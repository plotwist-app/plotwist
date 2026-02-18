import { Resend } from 'resend'
import { config } from '@/config'
import type { EmailMessage } from '@/domain/entities/email-message'
import { withAdapterTracing } from '@/infra/telemetry/with-adapter-tracing'
import type { EmailService } from '@/ports/email-service'

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
  sendEmail: withAdapterTracing('resend-send-email', sendEmail),
}

export { ResendAdapter }
