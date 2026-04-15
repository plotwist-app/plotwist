import { getUserImport } from '@/infra/db/repositories/user-import-repository'

export async function getUserImportById(id: string) {
  const result = await getUserImport(id)

  return result
}
