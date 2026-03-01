import { timingSafeEqual } from 'node:crypto'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { config } from '@/config'
import { logger } from '@/infra/adapters/logger'

const SKIP_PATHS = ['/health', '/complete-stripe-subscription']
const ALLOWED_ORIGINS = ['https://plotwist.app']

function pathMatches(path: string) {
  return SKIP_PATHS.some(s => path === s || path.endsWith(s))
}

function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB)
}

function allowedOrigin(
  origin: string | undefined,
  referer: string | undefined
): boolean {
  const allowed = [...new Set([config.app.CLIENT_URL, ...ALLOWED_ORIGINS])]
  return (
    (typeof origin === 'string' && allowed.includes(origin)) ||
    (typeof referer === 'string' && allowed.some(o => referer.startsWith(o)))
  )
}

function forbidden(request: FastifyRequest, reply: FastifyReply) {
  logger.warn(
    {
      method: request.method,
      url: request.url,
      path: request.url.split('?')[0],
      origin: request.headers.origin,
      referer: request.headers.referer,
      statusCode: 403,
      userId: (request as { user?: { id: string } }).user?.id,
    },
    'HTTP 403: Request not allowed from this client'
  )
  return reply.status(403).send({
    statusCode: 403,
    error: 'Forbidden',
    message: 'Request not allowed from this client.',
  })
}

function validIosToken(request: FastifyRequest, app: FastifyInstance): boolean {
  const expected = config.app.IOS_TOKEN
  if (!expected) {
    app.log.warn('X-IOS-Token received but IOS_TOKEN is not set.')
    return false
  }
  const received = request.headers['x-ios-token']
  return typeof received === 'string' && timingSafeCompare(received, expected)
}

/**
 * Production-only guard:
 * - X-IOS-Token present → must match IOS_TOKEN.
 * - X-Android-Token present → not implemented (403).
 * - Otherwise → allow only if Origin/Referer is in allowed list (e.g. plotwist.app).
 */
export function registerClientGuard(app: FastifyInstance) {
  app.addHook('onRequest', async (request, reply) => {
    if (config.app.APP_ENV !== 'production') return
    const path = request.url.split('?')[0]
    if (pathMatches(path)) return

    const iosToken = request.headers['x-ios-token']
    if (typeof iosToken === 'string' && iosToken.length > 0) {
      if (!validIosToken(request, app)) return forbidden(request, reply)
      return
    }

    const androidToken = request.headers['x-android-token']
    if (typeof androidToken === 'string' && androidToken.length > 0) {
      app.log.warn('X-Android-Token received but not implemented yet.')
      return forbidden(request, reply)
    }

    if (allowedOrigin(request.headers.origin, request.headers.referer)) return
    return forbidden(request, reply)
  })
}
