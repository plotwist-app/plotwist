import type { ImportStatusEnum } from '@/@types/import-item-status-enum'
import { eq } from 'drizzle-orm'
import { db } from '..'
import { schema } from '../schema'

export async function updateImportMoviesStatus(
  id: string,
  status: ImportStatusEnum
) {
  return await db
    .update(schema.importMovies)
    .set({ importStatus: status })
    .where(eq(schema.importMovies.id, id))
    .returning()
}

export async function getImportMovie(id: string) {
  const [movie] = await db
    .select()
    .from(schema.importMovies)
    .where(eq(schema.importMovies.id, id))

  return movie
}
