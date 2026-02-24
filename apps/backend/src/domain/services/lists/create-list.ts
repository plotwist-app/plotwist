import type { InferInsertModel } from 'drizzle-orm'
import { insertList } from '@/infra/db/repositories/list-repository'
import type { schema } from '@/infra/db/schema'
import { isForeignKeyViolation } from '@/infra/db/utils/postgres-errors'
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
    if (isForeignKeyViolation(error)) {
      return new UserNotFoundError()
    }

    throw error
  }
}
