import type { InsertLike } from '@/domain/entities/likes'
import { insertLike } from '@/infra/db/repositories/likes-repository'

export async function createLikeService(values: InsertLike) {
  const [like] = await insertLike(values)
  return { like }
}
