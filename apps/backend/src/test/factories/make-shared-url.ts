import { randomInt } from 'node:crypto'
import { faker } from '@faker-js/faker'
import type { SharedUrl } from '@/domain/entities/shared-urls'
import { createShortUrl } from '@/domain/services/shared-urls/create-short-url'
import { redisClient } from '@/test/mocks/redis'
import { makeUser } from './make-user'

/** Tests skip production counter semantics (14M start); salt 0 keeps base62 predictable. */
const TEST_SALT = 0

type Overrides = Partial<Pick<SharedUrl, 'userId'>> & {
  longUrl?: string
  counterKey?: string
}

/**
 * Pre-seed counter so INCR doesn't all start at 1 (avoids duplicate short codes
 * across tests). Random offset only—no production 14M rule.
 */
async function seedCounterUnique(counterKey: string) {
  await redisClient.set(counterKey, String(randomInt(1, 1_000_000_000)))
}

export async function makeSharedUrl(overrides: Overrides = {}) {
  const userId = overrides.userId ?? (await makeUser()).id
  const longUrl =
    overrides.longUrl ?? `https://plotwist.app/en-US/lists/${faker.string.uuid()}`
  const counterKey =
    overrides.counterKey ?? `test:factory:${faker.string.nanoid()}`

  await seedCounterUnique(counterKey)

  const shortCode = await createShortUrl({
    redis: redisClient,
    counterKey,
    salt: TEST_SALT,
    longUrl,
    userId,
  })

  return { shortCode, longUrl, userId }
}
