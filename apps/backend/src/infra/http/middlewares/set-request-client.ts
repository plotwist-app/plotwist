import { trace } from '@opentelemetry/api'
import type { FastifyReply, FastifyRequest } from 'fastify'

function getClient(request: FastifyRequest): string {
  const x = request.headers['x-client']?.toString().toLowerCase().trim()
  return x === 'web' ? 'web' : 'ios'
}

export async function setRequestClient(
  request: FastifyRequest,
  _reply: FastifyReply
) {
  trace.getActiveSpan()?.setAttribute('client.platform', getClient(request))
}
