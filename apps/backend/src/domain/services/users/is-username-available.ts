import { getUserByUsername } from '@/db/repositories/user-repository'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'
import { UsernameAlreadyRegisteredError } from '../../errors/username-already-registered'

interface IsUsernameAvailableInterface {
  username: string
}

const checkAvailableUsernameImpl = async ({
  username,
}: IsUsernameAvailableInterface) => {
  const [user] = await getUserByUsername(username)

  if (user) {
    return new UsernameAlreadyRegisteredError()
  }

  return { available: true }
}

export const checkAvailableUsername = withServiceTracing(
  'check-username-available',
  checkAvailableUsernameImpl
)
