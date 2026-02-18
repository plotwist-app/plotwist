import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { withTracing } from '@/infra/telemetry/with-tracing'

import {
  createWatchEntryController,
  deleteWatchEntryController,
  getWatchEntriesController,
  updateWatchEntryController,
} from '../controllers/watch-entries-controller'
import { verifyJwt } from '../middlewares/verify-jwt'
import {
  createWatchEntryBodySchema,
  createWatchEntryResponseSchema,
  deleteWatchEntryParamsSchema,
  getWatchEntriesQuerySchema,
  getWatchEntriesResponseSchema,
  updateWatchEntryBodySchema,
  updateWatchEntryParamsSchema,
  updateWatchEntryResponseSchema,
} from '../schemas/watch-entries'

const WATCH_ENTRIES_TAGS = ['Watch Entries']

export async function watchEntriesRoutes(app: FastifyInstance) {
  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/watch-entry',
      onRequest: [verifyJwt],
      schema: {
        description: 'Create a watch entry',
        tags: WATCH_ENTRIES_TAGS,
        body: createWatchEntryBodySchema,
        response: createWatchEntryResponseSchema,
        security: [{ bearerAuth: [] }],
      },
      handler: withTracing('create-watch-entry', createWatchEntryController),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/watch-entries',
      onRequest: [verifyJwt],
      schema: {
        description: 'Get watch entries for a user item',
        tags: WATCH_ENTRIES_TAGS,
        querystring: getWatchEntriesQuerySchema,
        response: getWatchEntriesResponseSchema,
        security: [{ bearerAuth: [] }],
      },
      handler: withTracing('get-watch-entries', getWatchEntriesController),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'PUT',
      url: '/watch-entry/:id',
      onRequest: [verifyJwt],
      schema: {
        description: 'Update a watch entry',
        tags: WATCH_ENTRIES_TAGS,
        params: updateWatchEntryParamsSchema,
        body: updateWatchEntryBodySchema,
        response: updateWatchEntryResponseSchema,
        security: [{ bearerAuth: [] }],
      },
      handler: withTracing('update-watch-entry', updateWatchEntryController),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'DELETE',
      url: '/watch-entry/:id',
      onRequest: [verifyJwt],
      schema: {
        description: 'Delete a watch entry',
        tags: WATCH_ENTRIES_TAGS,
        params: deleteWatchEntryParamsSchema,
        security: [{ bearerAuth: [] }],
      },
      handler: withTracing('delete-watch-entry', deleteWatchEntryController),
    })
  )
}
