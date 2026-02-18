import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { withTracing } from '@/infra/telemetry/with-tracing'

import {
  deleteUserItemController,
  getAllUserItemsController,
  getUserItemController,
  getUserItemsController,
  getUserItemsCountController,
  reorderUserItemsController,
  upsertUserItemController,
} from '../controllers/user-items-controller'
import { verifyJwt } from '../middlewares/verify-jwt'
import {
  deleteUserItemParamsSchema,
  getAllUserItemsQuerySchema,
  getAllUserItemsResponseSchema,
  getUserItemQuerySchema,
  getUserItemResponseSchema,
  getUserItemsBodySchema,
  getUserItemsCountQuerySchema,
  getUserItemsCountResponseSchema,
  getUserItemsResponseSchema,
  reorderUserItemsBodySchema,
  upsertUserItemBodySchema,
  upsertUserItemResponseSchema,
} from '../schemas/user-items'

const USER_ITEMS_TAGS = ['User items']

export async function userItemsRoutes(app: FastifyInstance) {
  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'PUT',
      url: '/user/item',
      onRequest: [verifyJwt],
      schema: {
        description: 'Upsert user item',
        tags: USER_ITEMS_TAGS,
        body: upsertUserItemBodySchema,
        response: upsertUserItemResponseSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      handler: withTracing('upsert-user-item', (request, reply) =>
        upsertUserItemController(request, reply, app.redis)
      ),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/user/items',
      schema: {
        description: 'Get user items',
        tags: USER_ITEMS_TAGS,
        body: getUserItemsBodySchema,
        response: getUserItemsResponseSchema,
        operationId: 'getUserItems',
      },
      handler: withTracing('get-user-items', (request, reply) =>
        getUserItemsController(request, reply, app.redis)
      ),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'DELETE',
      url: '/user/item/:id',
      onRequest: [verifyJwt],
      schema: {
        description: 'Delete user item',
        tags: USER_ITEMS_TAGS,
        params: deleteUserItemParamsSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      handler: withTracing('delete-user-item', (request, reply) =>
        deleteUserItemController(request, reply, app.redis)
      ),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/user/item',
      onRequest: [verifyJwt],
      schema: {
        description: 'Get user item',
        tags: USER_ITEMS_TAGS,
        querystring: getUserItemQuerySchema,
        response: getUserItemResponseSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      handler: withTracing('get-user-item', getUserItemController),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/user/items/all',
      schema: {
        description: 'Get user items',
        tags: USER_ITEMS_TAGS,
        querystring: getAllUserItemsQuerySchema,
        response: getAllUserItemsResponseSchema,
        operationId: 'getAllUserItems',
      },
      handler: withTracing('get-all-user-items', getAllUserItemsController),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'PUT',
      url: '/user/items/reorder',
      onRequest: [verifyJwt],
      schema: {
        description: 'Reorder user items in a collection',
        tags: USER_ITEMS_TAGS,
        body: reorderUserItemsBodySchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      handler: withTracing('reorder-user-items', reorderUserItemsController),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/user/items/count',
      schema: {
        description: 'Get user items count',
        tags: USER_ITEMS_TAGS,
        querystring: getUserItemsCountQuerySchema,
        response: getUserItemsCountResponseSchema,
        operationId: 'getUserItemsCount',
      },
      handler: withTracing('get-user-items-count', getUserItemsCountController),
    })
  )
}
