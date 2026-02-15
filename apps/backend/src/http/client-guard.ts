import { timingSafeEqual } from 'node:crypto'
import type { FastifyInstance, FastifyReply } from 'fastify'
import { config } from '@/config'

const SKIP_PATHS = ['/health', '/complete-stripe-subscription']

const ALLOWED_ORIGINS = ['https://plotwist.app']

function getPath(url: string): string {
  return url.split('?')[0]
}

function isPathSkipped(path: string): boolean {
  return SKIP_PATHS.some(skip => path === skip || path.endsWith(skip))
}

function getAllowedOrigins(): string[] {
  return [...new Set([config.app.CLIENT_URL, ...ALLOWED_ORIGINS])]
}

function isTokenValid(received: string, expected: string): boolean {
  if (received.length !== expected.length) return false
  const a = Buffer.from(received, 'utf8')
  const b = Buffer.from(expected, 'utf8')
  return a.length === b.length && timingSafeEqual(a, b)
}

function isOriginAllowed(
  origin: string | undefined,
  referer: string | undefined,
  allowed: string[]
): boolean {
  if (typeof origin === 'string' && allowed.some(o => origin === o)) return true
  if (typeof referer === 'string' && allowed.some(o => referer.startsWith(o)))
    return true
  return false
}

function forbidden(reply: FastifyReply) {
  return reply.status(403).send({
    statusCode: 403,
    error: 'Forbidden',
    message: 'Request not allowed from this client.',
  })
}

/**
 * Production-only guard:
 * - If X-Client-Token is present: validate against CLIENT_TOKEN; allow only if valid.
 * - If X-Client-Token is absent: allow only if Origin is in allowed list (e.g. plotwist.app).
 */
export function registerClientGuard(app: FastifyInstance) {
  app.addHook('onRequest', async (request, reply) => {
    if (config.app.APP_ENV !== 'production') return
    if (isPathSkipped(getPath(request.url))) return

    const tokenHeader = request.headers['x-client-token']
    const hasToken = typeof tokenHeader === 'string' && tokenHeader.length > 0

    if (hasToken) {
      const expectedToken = config.app.CLIENT_TOKEN
      if (!expectedToken) {
        app.log.warn('X-Client-Token received but CLIENT_TOKEN is not set.')
        return forbidden(reply)
      }
      if (isTokenValid(tokenHeader, expectedToken)) return
      return forbidden(reply)
    }

    const allowed = getAllowedOrigins()
    if (
      isOriginAllowed(request.headers.origin, request.headers.referer, allowed)
    )
      return

    return forbidden(reply)
  })
}
