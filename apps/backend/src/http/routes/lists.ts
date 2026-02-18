import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { withTracing } from '@/infra/telemetry/with-tracing'

import {
  createListController,
  deleteListController,
  getListController,
  getListProgressController,
  getListsController,
  updateListBannerController,
  updateListController,
} from '../controllers/list-controller'
import { verifyJwt } from '../middlewares/verify-jwt'
import { verifyOptionalJwt } from '../middlewares/verify-optional-jwt'
import {
  createListBodySchema,
  createListResponseSchema,
  deleteListParamsSchema,
  deleteListResponseSchema,
  getListParamsSchema,
  getListProgressResponseSchema,
  getListResponseSchema,
  getListsQuerySchema,
  getListsResponseSchema,
  updateListBannerBodySchema,
  updateListBannerResponseSchema,
  updateListBodySchema,
  updateListParamsSchema,
  updateListResponseSchema,
} from '../schemas/lists'

export async function listsRoute(app: FastifyInstance) {
  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/list',
      onRequest: [verifyJwt],
      schema: {
        description: 'Create a list',
        tags: ['List'],
        body: createListBodySchema,
        response: createListResponseSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      handler: withTracing('create-list', createListController),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/lists',
      onRequest: [verifyOptionalJwt],
      schema: {
        description: 'Get lists',
        tags: ['List'],
        querystring: getListsQuerySchema,
        response: getListsResponseSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      handler: withTracing('get-lists', getListsController),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'DELETE',
      url: '/list/:id',
      onRequest: [verifyJwt],
      schema: {
        description: 'Delete list',
        tags: ['List'],
        params: deleteListParamsSchema,
        response: deleteListResponseSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      handler: withTracing('delete-list', deleteListController),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'PUT',
      url: '/list/:id',
      onRequest: [verifyJwt],
      schema: {
        description: 'Update list',
        tags: ['List'],
        params: updateListParamsSchema,
        body: updateListBodySchema,
        response: updateListResponseSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      handler: withTracing('update-list', updateListController),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/list/by/:id',
      onRequest: [verifyOptionalJwt],
      schema: {
        description: 'Get list by ID',
        tags: ['List'],
        params: getListParamsSchema,
        response: getListResponseSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      handler: withTracing('get-list', getListController),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'PATCH',
      url: '/list/banner',
      onRequest: [verifyJwt],
      schema: {
        description: 'Update list banner by ID',
        tags: ['List'],
        body: updateListBannerBodySchema,
        response: updateListBannerResponseSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      handler: withTracing('update-list-banner', updateListBannerController),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/list/:id/progress',
      onRequest: [verifyJwt],
      schema: {
        description: 'Get list progress',
        tags: ['List'],
        params: getListParamsSchema,
        response: getListProgressResponseSchema,
        operationId: 'getListProgress',
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      handler: withTracing('get-list-progress', getListProgressController),
    })
  )
}
