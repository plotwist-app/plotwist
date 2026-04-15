import { describe, expect, it } from 'vitest'
import { makeUser } from '@/test/factories/make-user'
import { createInMemoryCounter } from '@/test/mocks/counter'
import { createShortUrl } from './create-short-url'
import { getSharedUrl } from './get-shared-url'

describe('createShortUrl', () => {
  it('should create a short url and persist it', async () => {
    const counter = createInMemoryCounter()
    const user = await makeUser()
    const longUrl = 'https://plotwist.app/en-US/lists/some-uuid'

    const shortCode = await createShortUrl({
      counter,
      salt: 0,
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
    const counter = createInMemoryCounter()
    const user = await makeUser()

    const code1 = await createShortUrl({
      counter,
      salt: 0,
      longUrl: 'https://plotwist.app/en-US/movies/123',
      userId: user.id,
    })
    const code2 = await createShortUrl({
      counter,
      salt: 0,
      longUrl: 'https://plotwist.app/en-US/movies/456',
      userId: user.id,
    })

    expect(code1).not.toBe(code2)
  })

  it('should return existing short code when same user shares same URL again', async () => {
    const counter = createInMemoryCounter()
    const user = await makeUser()
    const longUrl = 'https://plotwist.app/en-US/tv-series/95479'

    const code1 = await createShortUrl({
      counter,
      salt: 0,
      longUrl,
      userId: user.id,
    })
    const code2 = await createShortUrl({
      counter,
      salt: 0,
      longUrl,
      userId: user.id,
    })

    expect(code1).toBe(code2)
  })
})
