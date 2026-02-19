import { insertUserActivity } from '@/db/repositories/user-activities'
import type { InsertUserActivity } from '@/domain/entities/user-activity'

export async function createUserActivity(params: InsertUserActivity) {
  return await insertUserActivity(params)
}
