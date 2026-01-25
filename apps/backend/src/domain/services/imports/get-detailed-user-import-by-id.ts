import { getDetailedUserImport } from '@/db/repositories/user-import-repository'

export async function getDetailedUserImportById(id: string) {
  const result = await getDetailedUserImport(id)

  return result
}
