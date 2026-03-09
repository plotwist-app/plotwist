import { trace } from '@opentelemetry/api'
import type { FastifyRequest } from 'fastify'

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
