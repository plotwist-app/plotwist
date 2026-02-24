import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { schema } from '@/infra/db/schema'
import type { ImportMovie, InsertImportMovie } from './import-movies'
import type { ImportSeries, InsertImportSeries } from './import-series'

export type UserImport = InferSelectModel<typeof schema.userImports>

export type DetailedUserImport = UserImport & {
  movies: ImportMovie[]
  series: ImportSeries[]
}

type InsertUserImport = InferInsertModel<typeof schema.userImports>

export type InsertUserImportWithItems = InsertUserImport & {
  movies: InsertImportMovie[]
  series: InsertImportSeries[]
}
