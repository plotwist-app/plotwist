import { getUserById as getById } from '@/infra/db/repositories/user-repository'
import { UserNotFoundError } from '../../errors/user-not-found'

export async function getUserById(id: string) {
  const [user] = await getById(id)

  if (!user) {
    return new UserNotFoundError()
  }

  return { user }
}
