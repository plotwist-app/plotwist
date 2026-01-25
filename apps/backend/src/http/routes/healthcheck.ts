import type { FastifyInstance } from 'fastify'

export const healthCheck = (app: FastifyInstance) =>
  app.route({
    method: 'GET',
    url: '/health',
    handler: (_request, reply) => {
      reply.send({ alive: true })
    },
  })
