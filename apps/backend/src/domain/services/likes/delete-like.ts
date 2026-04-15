import { deleteLike } from '@/infra/db/repositories/likes-repository'

export async function deleteLikeService(id: string) {
  const [like] = await deleteLike(id)

  return { like }
}
