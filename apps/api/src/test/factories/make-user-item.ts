import { upsertUserItem } from '@/db/repositories/user-item-repository'
import type { InsertUserItem, UserItem } from '@/domain/entities/user-item'
import { faker } from '@faker-js/faker'
import * as changeKeys from 'change-case/keys'

type Overrides = Partial<InsertUserItem> & {
  userId: string
}

export function makeRawUserItem(overrides: Overrides): InsertUserItem {
  return {
    tmdbId: faker.number.int({ min: 1, max: 1_0000 }),
    mediaType: 'MOVIE',
    status: 'WATCHLIST',
    ...overrides,
  }
}

export async function makeUserItem(overrides: Overrides) {
  const [userItem] = await upsertUserItem(makeRawUserItem(overrides))

  return changeKeys.camelCase(userItem) as UserItem
}
