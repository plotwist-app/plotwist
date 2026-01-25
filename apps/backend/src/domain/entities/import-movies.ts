import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { schema } from '@/db/schema'

export type ImportMovie = InferSelectModel<typeof schema.importMovies>

export type InsertImportMovie = Omit<
  InferInsertModel<typeof schema.importMovies>,
  'importId' | 'id'
>
