import { ResendAdapter } from '@/adapters/resend'
import type { EmailService } from '@/ports/email-service'

type EmailProvider = 'Resend'

export function emailServiceFactory(provider: EmailProvider): EmailService {
  switch (provider) {
    case 'Resend':
      return ResendAdapter

    default:
      throw new Error(`Unsupported email provider: ${provider}`)
  }
}
