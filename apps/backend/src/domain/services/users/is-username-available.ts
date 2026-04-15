import { getUserByUsername } from '@/infra/db/repositories/user-repository'
import { UsernameAlreadyRegisteredError } from '../../errors/username-already-registered'

interface IsUsernameAvailableInterface {
  username: string
}

export async function checkAvailableUsername({
  username,
}: IsUsernameAvailableInterface) {
  const [user] = await getUserByUsername(username)

  if (user) {
    return new UsernameAlreadyRegisteredError()
  }

  return { available: true }
}
