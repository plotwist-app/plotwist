import { getListById } from '@/db/repositories/list-repository'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'
import { ListNotFoundError } from '../../errors/list-not-found-error'

type GetListInput = {
  id: string
  authenticatedUserId?: string
}

const getListServiceImpl = async ({
  id,
  authenticatedUserId,
}: GetListInput) => {
  const [list] = await getListById(id, authenticatedUserId)

  if (!list) {
    return new ListNotFoundError()
  }

  return { list }
}

export const getListService = withServiceTracing('get-list', getListServiceImpl)
