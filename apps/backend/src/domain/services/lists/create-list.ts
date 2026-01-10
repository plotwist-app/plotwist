import { insertList } from '@/db/repositories/list-repository'
import type { schema } from '@/db/schema'
import { PgIntegrityConstraintViolation } from '@/db/utils/postgres-errors'
import type { InferInsertModel } from 'drizzle-orm'
import postgres from 'postgres'
import { UserNotFoundError } from '../../errors/user-not-found'

export type CreateListInput = InferInsertModel<typeof schema.lists>

export async function createList({
  title,
  description,
  visibility = 'PUBLIC',
  userId,
}: CreateListInput) {
  try {
    const [list] = await insertList({ title, description, visibility, userId })

    return { list }
  } catch (error) {
    if (error instanceof postgres.PostgresError) {
      if (error.code === PgIntegrityConstraintViolation.ForeignKeyViolation) {
        return new UserNotFoundError()
      }
    }

    throw error
  }
}
