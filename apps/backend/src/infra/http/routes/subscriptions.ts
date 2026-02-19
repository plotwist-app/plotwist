import type { FastifyInstance } from 'fastify'

import { deleteSubscriptionController } from '../controllers/subscriptions-controller'
import { verifyJwt } from '../middlewares/verify-jwt'
import {
  deleteSubscriptionBodySchema,
  deleteSubscriptionResponseSchema,
} from '../schemas/subscriptions'

export const subscriptionsRoutes = (app: FastifyInstance) =>
  app.route({
    method: 'DELETE',
    url: '/user/subscription',
    onRequest: [verifyJwt],
    schema: {
      description: 'Delete user subscription',
      tags: ['subscriptions'],

      body: deleteSubscriptionBodySchema,
      response: deleteSubscriptionResponseSchema,
      security: [
        {
          bearerAuth: [],
        },
      ],
    },

    handler: deleteSubscriptionController,
  })
