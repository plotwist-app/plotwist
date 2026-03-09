import { trace } from '@opentelemetry/api'
import { metrics } from '@opentelemetry/api'
import type { FastifyRedis } from '@fastify/redis'
import { base62Encode } from '@/domain/helpers/base62'
import { insertSharedUrl } from '@/infra/db/repositories/shared-urls-repository'
import { createHash } from 'node:crypto'

const tracer = trace.getTracer('shared-urls', '1.0.0')

let urlShortenedCounter: ReturnType<
  ReturnType<typeof metrics.getMeter>['createCounter']
> | null = null

function getUrlShortenedCounter() {
  if (urlShortenedCounter === null) {
    const meter = metrics.getMeter('plotwist-api', '0.1.0')
    urlShortenedCounter = meter.createCounter('urls_shortened_total', {
      description: 'Total number of URLs shortened',
      unit: '1',
    })
  }
  return urlShortenedCounter
}

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
 */
export async function createShortUrl(input: CreateShortUrlInput): Promise<string> {
  const { redis, counterKey, salt, longUrl, userId } = input
  const span = tracer.startSpan('CreateShortUrl')
  let err: Error | undefined

  try {
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

    const counter = getUrlShortenedCounter()
    counter?.add(1, { service: 'plotwist-api' })

    return shortCode
  } catch (e) {
    err = e instanceof Error ? e : new Error(String(e))
    span.recordException(err)
    span.setStatus({ code: 2, message: err.message })
    throw err
  } finally {
    span.end()
  }
}
