import { insertUserImport } from '@/db/repositories/user-import-repository'
import { isForeignKeyViolation } from '@/db/utils/postgres-errors'
import type { InsertUserImportWithItems } from '@/domain/entities/import'
import { FailedToInsertUserImport } from '@/domain/errors/failed-to-import-user-items'
import { UserNotFoundError } from '@/domain/errors/user-not-found'

export async function createUserImport(params: InsertUserImportWithItems) {
  try {
    return await insertUserImport(params)
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      return new UserNotFoundError()
    }
    throw new FailedToInsertUserImport()
  }
}
