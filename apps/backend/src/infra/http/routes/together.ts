import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import {
  createTogetherRoomController,
  createTogetherSwipeController,
  getTogetherMatchesController,
  getTogetherRoomController,
  joinTogetherRoomController,
} from '../controllers/together-controller'
import { verifyOptionalJwt } from '../middlewares/verify-optional-jwt'
import {
  createTogetherRoomBodySchema,
  createTogetherSwipeBodySchema,
  createTogetherSwipeResponseSchema,
  getTogetherMatchesResponseSchema,
  getTogetherRoomResponseSchema,
  joinTogetherRoomBodySchema,
  togetherCodeParamsSchema,
  togetherSessionResponseSchema,
} from '../schemas/together'

const TAGS = ['Together']

export async function togetherRoutes(app: FastifyInstance) {
  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/together/rooms',
      onRequest: [verifyOptionalJwt],
      schema: {
        description: 'Create a Together room',
        tags: TAGS,
        body: createTogetherRoomBodySchema,
        response: togetherSessionResponseSchema,
        operationId: 'createTogetherRoom',
      },
      handler: createTogetherRoomController,
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/together/rooms/:code',
      schema: {
        description: 'Get a Together room',
        tags: TAGS,
        params: togetherCodeParamsSchema,
        response: getTogetherRoomResponseSchema,
        operationId: 'getTogetherRoom',
      },
      handler: getTogetherRoomController,
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/together/rooms/:code/join',
      onRequest: [verifyOptionalJwt],
      schema: {
        description: 'Join a Together room',
        tags: TAGS,
        params: togetherCodeParamsSchema,
        body: joinTogetherRoomBodySchema,
        response: togetherSessionResponseSchema,
        operationId: 'joinTogetherRoom',
      },
      handler: joinTogetherRoomController,
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/together/rooms/:code/swipes',
      schema: {
        description: 'Record a Together swipe',
        tags: TAGS,
        params: togetherCodeParamsSchema,
        body: createTogetherSwipeBodySchema,
        response: createTogetherSwipeResponseSchema,
        operationId: 'createTogetherSwipe',
      },
      handler: createTogetherSwipeController,
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/together/rooms/:code/matches',
      schema: {
        description: 'List Together matches',
        tags: TAGS,
        params: togetherCodeParamsSchema,
        response: getTogetherMatchesResponseSchema,
        operationId: 'getTogetherMatches',
      },
      handler: getTogetherMatchesController,
    })
  )
}
