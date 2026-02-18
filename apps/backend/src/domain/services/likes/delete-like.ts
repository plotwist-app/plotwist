import { deleteLike } from '@/db/repositories/likes-repository'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'

const deleteLikeServiceImpl = async (id: string) => {
  const [like] = await deleteLike(id)

  return { like }
}

export const deleteLikeService = withServiceTracing(
  'delete-like',
  deleteLikeServiceImpl
)
