import { deleteList } from '@/db/repositories/list-repository'

type DeleteListInput = { id: string; userId: string }

export async function deleteListService({ id }: DeleteListInput) {
  const [deletedList] = await deleteList(id)

  return deletedList
}
