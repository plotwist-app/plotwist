import { insertUser } from '@/db/repositories/user-repository'
import { PgIntegrityConstraintViolation } from '@/db/utils/postgres-errors'
import { hashPassword } from '@/utils/password'
import postgres from 'postgres'
import { EmailOrUsernameAlreadyRegisteredError } from '../../errors/email-or-username-already-registered-error'
import { HashPasswordError } from '../../errors/hash-password-error'

export type CreateUserInterface = {
  username: string
  email: string
  password: string
}

export async function createUser({
  username,
  email,
  password,
}: CreateUserInterface) {
  let hashedPassword: string

  try {
    hashedPassword = await hashPassword(password)
  } catch {
    return new HashPasswordError()
  }

  try {
    const [user] = await insertUser({
      email,
      password: hashedPassword,
      username,
    })

    const { password: removedPassword, ...formattedUser } = user

    return { user: { ...formattedUser, subscriptionType: 'MEMBER' } }
  } catch (error) {
    const isEmailOrUsernameAlreadyRegistered =
      error instanceof postgres.PostgresError &&
      error.code === PgIntegrityConstraintViolation.UniqueViolation

    if (isEmailOrUsernameAlreadyRegistered) {
      return new EmailOrUsernameAlreadyRegisteredError()
    }

    throw error
  }
}
