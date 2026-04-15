import { UserNotFoundError } from '@/domain/errors/user-not-found'
import {
  deleteUser as deleteUserFromDb,
  getUserById,
} from '@/infra/db/repositories/user-repository'

export async function deleteUserService(userId: string) {
  const [user] = await getUserById(userId)

  if (!user) {
    return new UserNotFoundError()
  }

  await deleteUserFromDb(userId)

  return { success: true }
}
