import { listUsersByUsernameLike } from '@/db/repositories/user-repository'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'

const searchUsersByUsernameImpl = async (username: string) => {
  const users = await listUsersByUsernameLike(username)

  return users
}

export const searchUsersByUsername = withServiceTracing(
  'search-users-by-username',
  searchUsersByUsernameImpl
)
