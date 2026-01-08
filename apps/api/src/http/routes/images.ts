import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { createImageController } from '../controllers/images-controller'
import { verifyJwt } from '../middlewares/verify-jwt'
import {
  createImageQuerySchema,
  createImageResponseSchema,
} from '../schemas/images'

export async function imagesRoutes(app: FastifyInstance) {
  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/image',
      onRequest: [verifyJwt],
      schema: {
        description: 'Create image',
        tags: ['Images'],
        security: [
          {
            bearerAuth: [],
          },
        ],
        response: createImageResponseSchema,
        querystring: createImageQuerySchema,
        consumes: ['multipart/form-data'],
      },
      handler: createImageController,
    })
  )
}
