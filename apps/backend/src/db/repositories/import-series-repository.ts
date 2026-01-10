import { eq } from 'drizzle-orm'
import type { ImportStatusEnum } from '@/@types/import-item-status-enum'
import { db } from '..'
import { schema } from '../schema'

export async function updateImportSeriesStatus(
  id: string,
  status: ImportStatusEnum
) {
  return await db
    .update(schema.importSeries)
    .set({ importStatus: status })
    .where(eq(schema.importSeries.id, id))
    .returning()
}

export async function getImportSeries(id: string) {
  const [series] = await db
    .select()
    .from(schema.importSeries)
    .where(eq(schema.importSeries.id, id))

  return series
}
