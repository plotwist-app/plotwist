import type { EmailMessage } from '@/domain/entities/email-message'

export interface EmailService {
  sendEmail(emailMessage: EmailMessage): Promise<void>
}
