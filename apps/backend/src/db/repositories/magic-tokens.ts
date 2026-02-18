import { eq } from 'drizzle-orm'
import type { InsertMagicTokenModel } from '@/domain/entities/magic-token'
import { withDbTracing } from '@/infra/telemetry/with-db-tracing'
import { db } from '..'
import { schema } from '../schema'

const insertMagicTokenImpl = async (values: InsertMagicTokenModel) => {
  return db.insert(schema.magicTokens).values(values)
}

export const insertMagicToken = withDbTracing(
  'insert-magic-token',
  insertMagicTokenImpl
)

const selectMagicTokenImpl = async (token: string) => {
  return db
    .select()
    .from(schema.magicTokens)
    .where(eq(schema.magicTokens.token, token))
}

export const selectMagicToken = withDbTracing(
  'select-magic-token',
  selectMagicTokenImpl
)

const invalidateMagicTokenImpl = async (token: string) => {
  return db
    .update(schema.magicTokens)
    .set({ used: true })
    .where(eq(schema.magicTokens.token, token))
}

export const invalidateMagicToken = withDbTracing(
  'invalidate-magic-token',
  invalidateMagicTokenImpl
)
