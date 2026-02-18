import type { FastifyInstance } from 'fastify'

import { withTracing } from '@/infra/telemetry/with-tracing'

export const healthCheck = (app: FastifyInstance) =>
  app.route({
    method: 'GET',
    url: '/health',
    config: { rateLimit: false },
    handler: withTracing('healthcheck', (_request, reply) =>
      reply.send({ alive: true })
    ),
  })
