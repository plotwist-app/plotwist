import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { deleteSubscriptionController } from '../controllers/subscriptions-controller'
import { verifyJwt } from '../middlewares/verify-jwt'
import {
  deleteSubscriptionBodySchema,
  deleteSubscriptionResponseSchema,
} from '../schemas/subscriptions'

const SUBSCRIPTIONS_TAG = ['subscriptions']

export async function subscriptionsRoutes(app: FastifyInstance) {
  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'DELETE',
      url: '/user/subscription',
      onRequest: [verifyJwt],
      schema: {
        description: 'Delete user subscription',
        operationId: 'deleteSubscription',
        tags: SUBSCRIPTIONS_TAG,
        body: deleteSubscriptionBodySchema,
        response: deleteSubscriptionResponseSchema,
        security: [{ bearerAuth: [] }],
      },
      handler: deleteSubscriptionController,
    })
  )
}
