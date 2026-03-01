import { faker } from '@faker-js/faker'
import type { InsertListItem } from '@/domain/entities/list-item'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schema'

type Overrides = Partial<InsertListItem> & { listId: string }

export function makeRawListItem(overrides: Overrides): InsertListItem {
  return {
    mediaType: 'MOVIE',
    tmdbId: faker.number.int({ min: 0, max: 1_000 }),
    ...overrides,
  }
}

export async function makeListItem(overrides: Overrides) {
  const [list] = await db
    .insert(schema.listItems)
    .values(makeRawListItem(overrides))
    .returning()

  return list
}
