import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { withTracing } from '@/infra/telemetry/with-tracing'

import {
  createUserEpisodesController,
  deleteUserEpisodesController,
  getUserEpisodesController,
} from '../controllers/user-episodes-controller'
import { verifyJwt } from '../middlewares/verify-jwt'
import {
  createUserEpisodesBodySchema,
  createUserEpisodesResponseSchema,
  deleteUserEpisodesBodySchema,
  deleteUserEpisodesResponseSchema,
  getUserEpisodesQuerySchema,
  getUserEpisodesResponseSchema,
} from '../schemas/user-episodes'

const USER_EPISODES_TAGS = ['User episodes']

export async function userEpisodesRoutes(app: FastifyInstance) {
  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/user/episodes',
      onRequest: [verifyJwt],
      schema: {
        description: 'Create user episode',
        tags: USER_EPISODES_TAGS,
        body: createUserEpisodesBodySchema,
        response: createUserEpisodesResponseSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      handler: withTracing('create-user-episodes', createUserEpisodesController),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/user/episodes',
      onRequest: [verifyJwt],
      schema: {
        description: 'Get user episode',
        tags: USER_EPISODES_TAGS,
        querystring: getUserEpisodesQuerySchema,
        response: getUserEpisodesResponseSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      handler: withTracing('get-user-episodes', getUserEpisodesController),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'DELETE',
      url: '/user/episodes',
      onRequest: [verifyJwt],
      schema: {
        description: 'Delete user episodes',
        tags: USER_EPISODES_TAGS,
        body: deleteUserEpisodesBodySchema,
        response: deleteUserEpisodesResponseSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      handler: withTracing('delete-user-episodes', deleteUserEpisodesController),
    })
  )
}
