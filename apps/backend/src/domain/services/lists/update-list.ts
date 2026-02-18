import type { InferInsertModel } from 'drizzle-orm'
import { updateList } from '@/db/repositories/list-repository'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'
import type { schema } from '@/db/schema'

export type UpdateListValues = Omit<
  InferInsertModel<typeof schema.lists>,
  'userId' | 'createdAt' | 'coverPath'
>

type UpdateListInput = {
  id: string
  userId: string
  values: UpdateListValues
}

const updateListServiceImpl = async ({
  id,
  userId,
  values,
}: UpdateListInput) => {
  const [updatedList] = await updateList(id, userId, values)
  return { list: updatedList }
}

export const updateListService = withServiceTracing(
  'update-list',
  updateListServiceImpl
)
