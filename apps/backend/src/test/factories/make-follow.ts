import type { Follow, InsertFollow } from '@/domain/entities/follow'
import { insertFollow } from '@/infra/db/repositories/followers-repository'

type Overrides = Partial<Follow> & {
  followerId: string
  followedId: string
}

export function makeRawFollow(overrides: Overrides): InsertFollow {
  return {
    ...overrides,
  }
}

export async function makeFollow(overrides: Overrides) {
  const [follow] = await insertFollow(makeRawFollow(overrides))

  return follow
}
