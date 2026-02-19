import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { schema } from '@/infra/db/schema'

export type ImportSeries = InferSelectModel<typeof schema.importSeries>

export type InsertImportSeries = Omit<
  InferInsertModel<typeof schema.importSeries>,
  'importId' | 'id'
>
