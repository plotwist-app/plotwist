import { createHash } from 'node:crypto'
import { base62Encode } from '@/domain/helpers/base62'
import {
  getSharedUrlByUserAndOriginalUrl,
  insertSharedUrl,
} from '@/infra/db/repositories/shared-urls-repository'
import type { Counter } from '@/infra/ports/counter'
import { recordUrlShortened } from '@/infra/telemetry/shared-urls-metrics'

export type CreateShortUrlInput = {
  counter: Counter
  salt: number
  longUrl: string
  userId: string
}

export async function createShortUrl(input: CreateShortUrlInput) {
  const { counter, salt, longUrl, userId } = input

  const existing = await getSharedUrlByUserAndOriginalUrl(userId, longUrl)
  if (existing) {
    return existing.url
  }

  const id = await counter.nextId()
  const shortCode = base62Encode(id, salt)

  const hashedUrl = createHash('sha256')
    .update(longUrl)
    .digest('hex')
    .slice(0, 64)

  await insertSharedUrl({
    url: shortCode,
    hashedUrl,
    originalUrl: longUrl,
    userId,
  })

  recordUrlShortened()

  return shortCode
}
