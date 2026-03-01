import type { FastifyRequest } from 'fastify'
import { trace } from '@opentelemetry/api'

export async function verifyOptionalJwt(request: FastifyRequest) {
  try {
    await request.jwtVerify()
    const userId = (request as { user?: { id: string } }).user?.id
    if (userId) {
      trace.getActiveSpan()?.setAttribute('user.id', userId)
    }
  } catch (err) {
    return err instanceof Error ? err : new Error(String(err))
  }
}
