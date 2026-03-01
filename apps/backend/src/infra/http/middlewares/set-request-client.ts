import { trace } from '@opentelemetry/api'
import type { FastifyReply, FastifyRequest } from 'fastify'

function getClient(request: FastifyRequest): string {
  const x = request.headers['X-Client']?.toString().toLowerCase().trim()
  return x === 'web' ? 'web' : 'ios'
}

export async function setRequestClient(
  request: FastifyRequest,
  _reply: FastifyReply
) {
  const client = getClient(request)
  ;(request as FastifyRequest & { clientPlatform: string }).clientPlatform =
    client
  trace.getActiveSpan()?.setAttribute('client.platform', client)
}
