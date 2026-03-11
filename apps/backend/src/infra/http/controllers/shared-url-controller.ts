import type { FastifyRedis } from '@fastify/redis'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { config } from '@/config'
import { createShortUrl } from '@/domain/services/shared-urls/create-short-url'
import { getSharedUrl } from '@/domain/services/shared-urls/get-shared-url'
import { sharedUrlCounterFactory } from '@/infra/factories/shared-url-counter-factory'
import {
  createSharedUrlBodySchema,
  getSharedUrlParamsSchema,
} from '@/infra/http/schemas/shared-url'

const PLOTWIST_HOSTS = [
  'plotwist.app',
  'www.plotwist.app',
  'localhost',
] as const

function isAllowedOriginalUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false
    }
    const host = parsed.hostname.toLowerCase()
    return PLOTWIST_HOSTS.some(
      h => host === h || host.endsWith(`.${h}`) || host.includes('localhost')
    )
  } catch {
    return false
  }
}

function buildShortUrl(shortCode: string): string {
  const base = config.app.CLIENT_URL.replace(/\/$/, '')
  return `${base}/${shortCode}`
}

export async function createSharedUrlController(
  request: FastifyRequest,
  reply: FastifyReply,
  redis: FastifyRedis
) {
  const { originalUrl } = createSharedUrlBodySchema.parse(request.body)

  if (!isAllowedOriginalUrl(originalUrl)) {
    return reply.status(400).send({
      message: 'originalUrl must be a plotwist URL',
    })
  }

  const counter = sharedUrlCounterFactory(
    redis,
    config.sharedUrls.SHARED_URLS_COUNTER_KEY
  )

  const shortCode = await createShortUrl({
    counter,
    salt: config.sharedUrls.SHARED_URLS_COUNTER_SALT,
    longUrl: originalUrl,
    userId: request.user.id,
  })

  return reply.status(201).send({
    shortCode,
    shortUrl: buildShortUrl(shortCode),
  })
}

export async function getSharedUrlController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { shortCode } = getSharedUrlParamsSchema.parse(request.params)

  const row = await getSharedUrl(shortCode)
  if (!row) {
    return reply.status(404).send({ message: 'Short URL not found' })
  }

  // When called with Accept: application/json (e.g. from the Next.js proxy),
  // return the original URL as JSON instead of issuing a browser redirect.
  if (request.headers.accept?.includes('application/json')) {
    return reply.status(200).send({ originalUrl: row.originalUrl })
  }

  return reply.redirect(row.originalUrl)
}
