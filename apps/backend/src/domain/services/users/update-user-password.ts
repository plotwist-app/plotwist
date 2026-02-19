import { InvalidTokenError } from '@/domain/errors/invalid-token-error'
import {
  invalidateMagicToken,
  selectMagicToken,
} from '@/infra/db/repositories/magic-tokens'
import { updateUserPassword } from '@/infra/db/repositories/user-repository'
import type { updateUserPasswordBodySchema } from '@/infra/http/schemas/users'
import { hashPassword } from '@/utils/password'

type UpdatePasswordInput = typeof updateUserPasswordBodySchema._type

export async function updatePasswordService({
  password,
  token,
}: UpdatePasswordInput) {
  const [tokenRecord] = await selectMagicToken(token)

  if (!token) {
    return new InvalidTokenError()
  }

  const hashedPassword = await hashPassword(password)
  await updateUserPassword(tokenRecord.userId, hashedPassword)
  await invalidateMagicToken(tokenRecord.token)

  return { status: 'password_set' }
}
