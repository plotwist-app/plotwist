import type { z } from 'zod'
import { findUserByEmailOrUsername } from '@/db/repositories/login-repository'
import { InvalidPasswordError } from '@/domain/errors/invalid-password-error'
import type { loginBodySchema } from '@/infra/http/schemas/login'
import { comparePassword } from '@/utils/password'
import { InvalidCredentialsError } from '../../errors/invalid-credentials-error'
import { generateMagicLinkTokenService } from '../magic-link/generate-magic-link'
import { sendMagicLinkEmailService } from '../magic-link/send-magic-link-email'

type LoginInput = z.infer<typeof loginBodySchema>

export async function loginService({ login, password, url }: LoginInput) {
  const user = await findUserByEmailOrUsername(login)

  if (!user) {
    return new InvalidCredentialsError()
  }

  if (user.isLegacy) {
    const { token } = await generateMagicLinkTokenService(user.id)
    await sendMagicLinkEmailService({ email: user.email, token, url })

    return { status: 'magic_link_sent' }
  }

  const isValidPassword = await comparePassword(password, user.password)
  if (!isValidPassword) {
    return new InvalidPasswordError()
  }

  const { password: removedPassword, ...formattedUser } = user
  return { user: formattedUser }
}
