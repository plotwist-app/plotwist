import type { ImportStatusEnum } from '@/@types/import-item-status-enum'
import { updateImportSeriesStatus as repository } from '@/infra/db/repositories/import-series-repository'
import { checkAndFinalizeImport } from '@/infra/db/repositories/user-import-repository'

export type UpdateUserImportInterface = {
  id: string
  newStatus: ImportStatusEnum
}

export async function updateImportSeriesStatus({
  id,
  newStatus,
}: UpdateUserImportInterface) {
  const [result] = await repository(id, newStatus)

  checkAndFinalizeImport(result.importId)

  return result
}
