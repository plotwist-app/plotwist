import type { schema } from '@/db/schema'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'

export type ImportSeries = InferSelectModel<typeof schema.importSeries>

export type InsertImportSeries = Omit<
  InferInsertModel<typeof schema.importSeries>,
  'importId' | 'id'
>
