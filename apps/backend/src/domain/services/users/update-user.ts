import type { z } from 'zod'
import { NoValidFieldsError } from '@/domain/errors/no-valid-fields'
import { UserNotFoundError } from '@/domain/errors/user-not-found'
import { UsernameAlreadyRegisteredError } from '@/domain/errors/username-already-registered'
import {
  getUserById,
  updateUser,
} from '@/infra/db/repositories/user-repository'
import { isUniqueViolation } from '@/infra/db/utils/postgres-errors'
import type { updateUserBodySchema } from '@/infra/http/schemas/users'

export type UpdateUserInput = z.infer<typeof updateUserBodySchema>

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
    const [updated] = await updateUser(userId, validData)

    if (!updated) {
      return new UserNotFoundError()
    }

    // Re-fetch user with joined data (subscriptionType, etc.) to match /me response shape
    const [user] = await getUserById(userId)

    if (!user) {
      return new UserNotFoundError()
    }

    return { user }
  } catch (error) {
    if (isUniqueViolation(error)) {
      return new UsernameAlreadyRegisteredError()
    }

    throw error
  }
}
