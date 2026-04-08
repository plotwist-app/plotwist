import type { InsertMagicTokenModel } from '@/domain/entities/magic-token'
import { insertMagicToken } from '@/infra/db/repositories/magic-tokens'
import { randomBytes } from 'node:crypto'

type Overrides = Partial<Omit<InsertMagicTokenModel, 'userId'>>

const FIFTEEN_MINUTES = () => new Date(Date.now() + 15 * 60000)

export async function makeMagicToken(
  userId: string,
  overrides: Overrides = {}
) {
  const values: InsertMagicTokenModel = {
    userId,
    token: randomBytes(32).toString('hex'),
    expiresAt: FIFTEEN_MINUTES(),
    ...overrides,
  }

  await insertMagicToken(values)
  return values
}
