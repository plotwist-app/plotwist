import { createHash } from 'node:crypto'
import type { FastifyRedis } from '@fastify/redis'
import { base62Encode } from '@/domain/helpers/base62'
import { insertSharedUrl } from '@/infra/db/repositories/shared-urls-repository'
import { recordUrlShortened } from '@/infra/telemetry/shared-urls-metrics'

export type CreateShortUrlInput = {
  redis: FastifyRedis
  counterKey: string
  salt: number
  longUrl: string
  userId: string
}

/**
 * Create a short URL: Redis INCR → base62 encode (with salt) → persist.
 * Returns the short code (e.g. "Hrtbs").
 *
 * Tracing: no manual spans here; the HTTP handler’s active span (fastify/otel)
 * covers the request. Metrics are recorded via infra/telemetry/shared-urls-metrics.
 */
export async function createShortUrl(input: CreateShortUrlInput) {
  const { redis, counterKey, salt, longUrl, userId } = input

  const id = await redis.incr(counterKey)
  if (typeof id !== 'number') {
    throw new Error('Redis INCR did not return a number')
  }

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
