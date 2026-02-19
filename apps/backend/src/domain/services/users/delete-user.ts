import {
  deleteUser as deleteUserFromDb,
  getUserById,
} from '@/db/repositories/user-repository'
import { UserNotFoundError } from '@/domain/errors/user-not-found'

export async function deleteUserService(userId: string) {
  const [user] = await getUserById(userId)

  if (!user) {
    return new UserNotFoundError()
  }

  await deleteUserFromDb(userId)

  return { success: true }
}
