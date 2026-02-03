import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import {
  deleteUserItemController,
  getAllUserItemsController,
  getUserItemController,
  getUserItemsController,
  getUserItemsCountController,
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
      handler: (request, reply) =>
        upsertUserItemController(request, reply, app.redis),
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
      handler: (request, reply) =>
        getUserItemsController(request, reply, app.redis),
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
      handler: (request, reply) =>
        deleteUserItemController(request, reply, app.redis),
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
      handler: getUserItemController,
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
      handler: getAllUserItemsController,
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
      handler: getUserItemsCountController,
    })
  )
}
