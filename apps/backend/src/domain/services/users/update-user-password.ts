import {
  invalidateMagicToken,
  selectMagicToken,
} from '@/db/repositories/magic-tokens'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'
import { updateUserPassword } from '@/db/repositories/user-repository'
import { InvalidTokenError } from '@/domain/errors/invalid-token-error'
import type { updateUserPasswordBodySchema } from '@/http/schemas/users'
import { hashPassword } from '@/utils/password'

type UpdatePasswordInput = typeof updateUserPasswordBodySchema._type

const updatePasswordServiceImpl = async ({
  password,
  token,
}: UpdatePasswordInput) => {
  const [tokenRecord] = await selectMagicToken(token)

  if (!token) {
    return new InvalidTokenError()
  }

  const hashedPassword = await hashPassword(password)
  await updateUserPassword(tokenRecord.userId, hashedPassword)
  await invalidateMagicToken(tokenRecord.token)

  return { status: 'password_set' }
}

export const updatePasswordService = withServiceTracing(
  'update-password',
  updatePasswordServiceImpl
)
