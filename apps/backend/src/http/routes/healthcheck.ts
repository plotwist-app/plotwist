import { trace } from '@opentelemetry/api'
import type { FastifyInstance, FastifyReply } from 'fastify'

export const healthCheck = (app: FastifyInstance) =>
  app.route({
    method: 'GET',
    url: '/health',
    config: { rateLimit: false },
    handler: (_request, reply) => {
      return healthcheckController(reply)
    },
  })

async function healthcheckController(reply: FastifyReply) {
  const tracer = trace.getTracer('healthcheck')

  return tracer.startActiveSpan('healthcheck-controller', async span => {
    span.setAttribute('http.method', 'GET')
    span.setAttribute('http.url', '/health')
    span.setAttribute('http.status_code', '200')
    span.end()

    return reply.status(404).send({ error: 'Not Found' })
  })
}
