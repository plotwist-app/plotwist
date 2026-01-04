import { getUserByUsername as getByUsername } from '@/db/repositories/user-repository'
import { UserNotFoundError } from '../../errors/user-not-found'

type GetUserByUsernameInput = {
  username: string
}

export async function getUserByUsername({ username }: GetUserByUsernameInput) {
  const [user] = await getByUsername(username)

  if (!user) {
    return new UserNotFoundError()
  }

  return { user }
}
