import { generateMagicLinkTokenService } from '@/domain/services/magic-link/generate-magic-link'
import { findUserByEmailOrUsername } from '@/infra/db/repositories/login-repository'
import { sendPasswordResetEmailService } from './send-password-reset-email'

type RequestPasswordResetInput = {
  login: string
}

export async function requestPasswordResetService({
  login,
}: RequestPasswordResetInput) {
  const user = await findUserByEmailOrUsername(login)

  if (user) {
    const { token } = await generateMagicLinkTokenService(user.id)
    await sendPasswordResetEmailService({ email: user.email, token })
  }

  return { status: 'password_reset_email_sent' as const }
}
