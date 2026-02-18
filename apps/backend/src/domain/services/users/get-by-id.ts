import { getUserById as getById } from '@/db/repositories/user-repository'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'
import { UserNotFoundError } from '../../errors/user-not-found'

const getUserByIdImpl = async (id: string) => {
  const [user] = await getById(id)

  if (!user) {
    return new UserNotFoundError()
  }

  return { user }
}

export const getUserById = withServiceTracing('get-user-by-id', getUserByIdImpl)
