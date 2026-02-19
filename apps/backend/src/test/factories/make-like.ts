import type { InsertLike, Like } from '@/domain/entities/likes'
import { insertLike } from '@/infra/db/repositories/likes-repository'

type Overrides = Partial<Like> &
  Pick<Like, 'userId' | 'entityType' | 'entityId'>

export function makeRawLike(overrides: Overrides): InsertLike {
  return {
    ...overrides,
  }
}

export async function makeLike(overrides: Overrides) {
  const [like] = await insertLike(makeRawLike(overrides))

  return like
}
