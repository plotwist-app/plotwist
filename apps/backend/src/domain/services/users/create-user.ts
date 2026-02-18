import { insertUser } from '@/db/repositories/user-repository'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'
import { isUniqueViolation } from '@/db/utils/postgres-errors'
import { hashPassword } from '@/utils/password'
import { EmailOrUsernameAlreadyRegisteredError } from '../../errors/email-or-username-already-registered-error'
import { HashPasswordError } from '../../errors/hash-password-error'

export type CreateUserInterface = {
  username: string
  email: string
  password: string
  displayName?: string
}

const createUserImpl = async ({
  username,
  email,
  password,
  displayName,
}: CreateUserInterface) => {
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
      displayName,
    })

    const { password: removedPassword, ...formattedUser } = user

    return { user: { ...formattedUser, subscriptionType: 'MEMBER' } }
  } catch (error) {
    if (isUniqueViolation(error)) {
      return new EmailOrUsernameAlreadyRegisteredError()
    }

    throw error
  }
}

export const createUser = withServiceTracing('create-user', createUserImpl)
