import postgres from 'postgres'
import { insertUserImport } from '@/db/repositories/user-import-repository'
import { PgIntegrityConstraintViolation } from '@/db/utils/postgres-errors'
import type { InsertUserImportWithItems } from '@/domain/entities/import'
import { FailedToInsertUserImport } from '@/domain/errors/failed-to-import-user-items'
import { UserNotFoundError } from '@/domain/errors/user-not-found'

export async function createUserImport(params: InsertUserImportWithItems) {
  try {
    return await insertUserImport(params)
  } catch (error) {
    if (error instanceof postgres.PostgresError) {
      if (error.code === PgIntegrityConstraintViolation.ForeignKeyViolation) {
        return new UserNotFoundError()
      }
    }
    throw new FailedToInsertUserImport()
  }
}
