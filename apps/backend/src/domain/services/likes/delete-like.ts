import { deleteLike } from '@/db/repositories/likes-repository'

export async function deleteLikeService(id: string) {
  const [like] = await deleteLike(id)

  return { like }
}
