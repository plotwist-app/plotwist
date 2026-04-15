import type { InsertUserImportWithItems } from '@/domain/entities/import'
import { FailedToInsertUserImport } from '@/domain/errors/failed-to-import-user-items'
import { UserNotFoundError } from '@/domain/errors/user-not-found'
import { insertUserImport } from '@/infra/db/repositories/user-import-repository'
import { isForeignKeyViolation } from '@/infra/db/utils/postgres-errors'

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
