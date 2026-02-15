import type { FastifyInstance } from 'fastify'

export const healthCheck = (app: FastifyInstance) =>
  app.route({
    method: 'GET',
    url: '/health',
    config: { rateLimit: false },
    handler: (_request, reply) => {
      reply.send({ alive: true })
    },
  })
