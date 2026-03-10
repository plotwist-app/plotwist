import { randomInt } from 'node:crypto'
import { beforeEach, describe, expect, it } from 'vitest'
import { makeUser } from '@/test/factories/make-user'
import { redisClient } from '@/test/mocks/redis'
import { createShortUrl } from './create-short-url'
import { getSharedUrl } from './get-shared-url'

const COUNTER_KEY = 'test:create_short_url:counter'

/** Tests skip production 14M counter rule; salt 0 avoids coupling to config. */
const TEST_SALT = 0

describe('createShortUrl', () => {
  beforeEach(async () => {
    await redisClient.set(COUNTER_KEY, String(randomInt(1, 1_000_000_000)))
  })

  it('should create a short url and persist it', async () => {
    const user = await makeUser()
    const longUrl = 'https://plotwist.app/en-US/lists/some-uuid'

    const shortCode = await createShortUrl({
      redis: redisClient,
      counterKey: COUNTER_KEY,
      salt: TEST_SALT,
      longUrl,
      userId: user.id,
    })

    expect(shortCode).toBeTruthy()
    expect(shortCode).toMatch(/^[0-9a-zA-Z]+$/)

    const stored = await getSharedUrl(shortCode)
    expect(stored).not.toBeNull()
    expect(stored?.originalUrl).toBe(longUrl)
  })

  it('should produce different short codes for sequential calls', async () => {
    const user = await makeUser()
    const input = {
      redis: redisClient,
      counterKey: COUNTER_KEY,
      salt: TEST_SALT,
      userId: user.id,
    }

    const code1 = await createShortUrl({
      ...input,
      longUrl: 'https://plotwist.app/en-US/movies/123',
    })
    const code2 = await createShortUrl({
      ...input,
      longUrl: 'https://plotwist.app/en-US/movies/456',
    })

    expect(code1).not.toBe(code2)
  })

  it('should increment the redis counter on each call', async () => {
    const counterKey = 'test:create_short_url:incr_check'
    await redisClient.del(counterKey)

    const user = await makeUser()
    const input = {
      redis: redisClient,
      counterKey,
      salt: TEST_SALT,
      longUrl: 'https://plotwist.app/en-US/tv-series/789',
      userId: user.id,
    }

    await createShortUrl(input)
    await createShortUrl(input)

    const counter = await redisClient.get(counterKey)
    expect(Number(counter)).toBe(2)
  })
})
