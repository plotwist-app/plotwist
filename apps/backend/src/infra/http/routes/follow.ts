import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import {
  createFollowController,
  deleteFollowController,
  getFollowController,
  getFollowersController,
} from '../controllers/follows-controller'
import { verifyJwt } from '../middlewares/verify-jwt'
import {
  createFollowBodySchema,
  deleteFollowBodySchema,
  getFollowersQuerySchema,
  getFollowersResponseSchema,
  getFollowQuerySchema,
  getFollowResponseSchema,
} from '../schemas/follow'

const TAGS = ['Follows']

export async function followsRoutes(app: FastifyInstance) {
  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/follow',
      onRequest: [verifyJwt],
      schema: {
        description: 'Follow user',
        tags: TAGS,
        security: [
          {
            bearerAuth: [],
          },
        ],
        body: createFollowBodySchema,
      },
      handler: createFollowController,
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/follow',
      onRequest: [verifyJwt],
      schema: {
        description: 'Get follow',
        tags: TAGS,
        security: [
          {
            bearerAuth: [],
          },
        ],
        querystring: getFollowQuerySchema,
        response: getFollowResponseSchema,
      },
      handler: getFollowController,
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'DELETE',
      url: '/follow',
      onRequest: [verifyJwt],
      schema: {
        description: 'Delete follow',
        tags: TAGS,
        security: [
          {
            bearerAuth: [],
          },
        ],
        body: deleteFollowBodySchema,
      },
      handler: deleteFollowController,
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/followers',
      schema: {
        description: 'Get followers',
        tags: TAGS,
        querystring: getFollowersQuerySchema,
        response: getFollowersResponseSchema,
        operationId: 'getFollowers',
      },
      handler: getFollowersController,
    })
  )
}
