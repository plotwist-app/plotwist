import { updateUser } from '@/db/repositories/user-repository'
import { PgIntegrityConstraintViolation } from '@/db/utils/postgres-errors'
import { NoValidFieldsError } from '@/domain/errors/no-valid-fields'
import { UserNotFoundError } from '@/domain/errors/user-not-found'
import { UsernameAlreadyRegisteredError } from '@/domain/errors/username-already-registered'
import type { updateUserBodySchema } from '@/http/schemas/users'
import postgres from 'postgres'

export type UpdateUserInput = typeof updateUserBodySchema._type

export async function updateUserService({
  userId,
  ...data
}: UpdateUserInput & {
  userId: string
}) {
  const validData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  )

  if (Object.keys(validData).length === 0) {
    return new NoValidFieldsError()
  }

  try {
    const [user] = await updateUser(userId, validData)

    if (!user) {
      return new UserNotFoundError()
    }

    return { user }
  } catch (error) {
    const isUsernameAlreadyRegistered =
      error instanceof postgres.PostgresError &&
      error.code === PgIntegrityConstraintViolation.UniqueViolation

    if (isUsernameAlreadyRegistered) {
      return new UsernameAlreadyRegisteredError()
    }

    throw error
  }
}
