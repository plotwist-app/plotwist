import type { InferInsertModel } from 'drizzle-orm'
import { insertList } from '@/db/repositories/list-repository'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'
import type { schema } from '@/db/schema'
import { isForeignKeyViolation } from '@/db/utils/postgres-errors'
import { UserNotFoundError } from '../../errors/user-not-found'

export type CreateListInput = InferInsertModel<typeof schema.lists>

const createListImpl = async ({
  title,
  description,
  visibility = 'PUBLIC',
  userId,
}: CreateListInput) => {
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

export const createList = withServiceTracing('create-list', createListImpl)
