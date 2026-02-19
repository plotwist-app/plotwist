import { listUsersByUsernameLike } from '@/db/repositories/user-repository'

export async function searchUsersByUsername(username: string) {
  const users = await listUsersByUsernameLike(username)

  return users
}
