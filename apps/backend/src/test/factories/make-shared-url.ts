import { faker } from '@faker-js/faker'
import type { SharedUrl } from '@/domain/entities/shared-urls'
import { createShortUrl } from '@/domain/services/shared-urls/create-short-url'
import { createInMemoryCounter } from '@/test/mocks/counter'
import { makeUser } from './make-user'

type Overrides = Partial<Pick<SharedUrl, 'userId'>> & {
  longUrl?: string
}

const counter = createInMemoryCounter()

export async function makeSharedUrl(overrides: Overrides = {}) {
  const userId = overrides.userId ?? (await makeUser()).id
  const longUrl =
    overrides.longUrl ??
    `https://plotwist.app/en-US/lists/${faker.string.uuid()}`

  const shortCode = await createShortUrl({
    counter,
    salt: 0,
    longUrl,
    userId,
  })

  return { shortCode, longUrl, userId }
}
