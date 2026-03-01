import type { FastifyReply, FastifyRequest } from 'fastify'
import { trace } from '@opentelemetry/api'
import { logger } from '@/infra/adapters/logger'

export async function verifyJwt(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
    const userId = (request as { user?: { id: string } }).user?.id
    if (userId) {
      trace.getActiveSpan()?.setAttribute('user.id', userId)
    }
  } catch (err) {
    logger.warn(
      {
        err: err instanceof Error ? err : new Error(String(err)),
        method: request.method,
        url: request.url,
        route: request.routeOptions?.url,
        statusCode: 401,
      },
      'HTTP 401: Unauthorized'
    )
    return reply.status(401).send({
      message: `Unauthorized: ${err instanceof Error ? err.message : String(err)}`,
    })
  }
}
