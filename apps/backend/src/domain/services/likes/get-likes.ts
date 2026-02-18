import { selectLikes } from '@/db/repositories/likes-repository'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'

const getLikesServiceImpl = async (entityId: string) => {
  const likes = await selectLikes(entityId)

  return { likes }
}

export const getLikesService = withServiceTracing(
  'get-likes',
  getLikesServiceImpl
)
