import { insertLike } from '@/db/repositories/likes-repository'
import type { InsertLike } from '@/domain/entities/likes'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'

const createLikeServiceImpl = async (values: InsertLike) => {
  const [like] = await insertLike(values)
  return { like }
}

export const createLikeService = withServiceTracing(
  'create-like',
  createLikeServiceImpl
)
