import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { withTracing } from '@/infra/telemetry/with-tracing'

import {
  createListItemController,
  deleteListItemController,
  getListItemsController,
  updateListItemController,
} from '../controllers/list-item-controller'
import { verifyJwt } from '../middlewares/verify-jwt'
import { languageQuerySchema } from '../schemas/common'
import {
  createListItemBodySchema,
  createListItemResponseSchema,
  deleteListItemParamSchema,
  getListItemsParamsSchema,
  getListItemsResponseSchema,
  updateListItemsBodySchema,
} from '../schemas/list-item'

const TAGS = ['List item']

export async function listItemRoute(app: FastifyInstance) {
  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/list-item',
      onRequest: [verifyJwt],
      schema: {
        description: 'Create list item',
        tags: TAGS,
        body: createListItemBodySchema,
        response: createListItemResponseSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      handler: withTracing('create-list-item', createListItemController),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/list-items/by/:listId',
      schema: {
        description: 'Create list item',
        tags: TAGS,
        params: getListItemsParamsSchema,
        querystring: languageQuerySchema,
        response: getListItemsResponseSchema,
      },
      handler: withTracing('get-list-items', (req, reply) =>
        getListItemsController(req, reply, app.redis)
      ),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'DELETE',
      url: '/list-item/:id',
      onRequest: [verifyJwt],
      schema: {
        description: 'Delete list item',
        tags: TAGS,
        params: deleteListItemParamSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      handler: withTracing('delete-list-item', deleteListItemController),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'PATCH',
      url: '/list-items',
      onRequest: [verifyJwt],
      schema: {
        description: 'Update list items position',
        operationId: 'updateListItemsPositions',
        tags: TAGS,
        body: updateListItemsBodySchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      handler: withTracing('update-list-item', updateListItemController),
    })
  )
}
