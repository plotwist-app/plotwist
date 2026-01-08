import { insertLike } from '@/db/repositories/likes-repository'
import type { InsertLike } from '@/domain/entities/likes'

export async function createLikeService(values: InsertLike) {
  const [like] = await insertLike(values)
  return { like }
}
