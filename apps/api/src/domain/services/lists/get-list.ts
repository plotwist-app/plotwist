import { getListById } from '@/db/repositories/list-repository'
import { ListNotFoundError } from '../../errors/list-not-found-error'

type GetListInput = {
  id: string
  authenticatedUserId?: string
}

export async function getListService({
  id,
  authenticatedUserId,
}: GetListInput) {
  const [list] = await getListById(id, authenticatedUserId)

  if (!list) {
    return new ListNotFoundError()
  }

  return { list }
}
