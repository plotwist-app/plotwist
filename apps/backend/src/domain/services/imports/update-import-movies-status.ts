import type { ImportStatusEnum } from '@/@types/import-item-status-enum'
import { updateImportMoviesStatus as repository } from '@/infra/db/repositories/import-movies-repository'
import { checkAndFinalizeImport } from '@/infra/db/repositories/user-import-repository'

export async function updateImportMoviesStatus(
  id: string,
  newStatus: ImportStatusEnum
) {
  const [result] = await repository(id, newStatus)

  checkAndFinalizeImport(result.importId)

  return result
}
