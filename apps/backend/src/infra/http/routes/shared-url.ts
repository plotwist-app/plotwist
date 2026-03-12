import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import {
  createSharedUrlController,
  getSharedUrlController,
} from '../controllers/shared-url-controller'
import { verifyJwt } from '../middlewares/verify-jwt'
import {
  createSharedUrlBodySchema,
  createSharedUrlResponseSchema,
  getSharedUrlParamsSchema,
  getSharedUrlResponseSchema,
} from '../schemas/shared-url'

const TAGS = ['Shared URL']

export async function sharedUrlRoute(app: FastifyInstance) {
  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/shared-url',
      onRequest: [verifyJwt],
      schema: {
        description: 'Create a short URL for a plotwist page',
        tags: TAGS,
        body: createSharedUrlBodySchema,
        response: createSharedUrlResponseSchema,
        security: [{ bearerAuth: [] }],
      },
      handler: (req, reply) => createSharedUrlController(req, reply, app.redis),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/shared-url/:shortCode',
      schema: {
        description: 'Resolve short code and redirect to original URL',
        tags: TAGS,
        params: getSharedUrlParamsSchema,
        response: getSharedUrlResponseSchema,
      },
      handler: getSharedUrlController,
    })
  )
}
