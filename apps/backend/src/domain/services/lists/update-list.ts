import type { InferInsertModel } from 'drizzle-orm'
import { updateList } from '@/infra/db/repositories/list-repository'
import type { schema } from '@/infra/db/schema'

export type UpdateListValues = Omit<
  InferInsertModel<typeof schema.lists>,
  'userId' | 'createdAt' | 'coverPath'
>

type UpdateListInput = {
  id: string
  userId: string
  values: UpdateListValues
}

export async function updateListService({
  id,
  userId,
  values,
}: UpdateListInput) {
  const [updatedList] = await updateList(id, userId, values)
  return { list: updatedList }
}
