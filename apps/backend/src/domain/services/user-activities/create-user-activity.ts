import type { InsertUserActivity } from '@/domain/entities/user-activity'
import { insertUserActivity } from '@/infra/db/repositories/user-activities'

export async function createUserActivity(params: InsertUserActivity) {
  return await insertUserActivity(params)
}
