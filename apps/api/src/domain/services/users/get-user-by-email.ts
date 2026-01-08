import { getUserByEmail } from '@/db/repositories/user-repository'
import { UserNotFoundError } from '../../errors/user-not-found'

export async function getUserByEmailService(email: string) {
  const [user] = await getUserByEmail(email)

  if (!user) {
    return new UserNotFoundError()
  }

  return { user }
}
