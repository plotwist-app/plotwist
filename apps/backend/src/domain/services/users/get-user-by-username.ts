import { getUserByUsername as getByUsername } from '@/db/repositories/user-repository'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'
import { UserNotFoundError } from '../../errors/user-not-found'

type GetUserByUsernameInput = {
  username: string
}

const getUserByUsernameImpl = async ({
  username,
}: GetUserByUsernameInput) => {
  const [user] = await getByUsername(username)

  if (!user) {
    return new UserNotFoundError()
  }

  return { user }
}

export const getUserByUsername = withServiceTracing(
  'get-user-by-username',
  getUserByUsernameImpl
)
