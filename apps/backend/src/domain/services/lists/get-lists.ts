import { selectLists } from '@/db/repositories/list-repository'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'

export type GetListsInput = {
  userId?: string
  limit?: number
  authenticatedUserId?: string
  visibility?: 'PUBLIC' | 'PRIVATE' | 'NETWORK'
  hasBanner?: boolean
}

const getListsServicesImpl = async (input: GetListsInput) => {
  const lists = await selectLists(input)

  return { lists }
}

export const getListsServices = withServiceTracing(
  'get-lists',
  getListsServicesImpl
)
