import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { createFeedbackController } from '../controllers/feedback-controller'
import { verifyJwt } from '../middlewares/verify-jwt'
import {
  createFeedbackBodySchema,
  createFeedbackResponseSchema,
} from '../schemas/feedback'

export async function feedbackRoutes(app: FastifyInstance) {
  const feedbackTag = 'Feedback'

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/feedback',
      onRequest: [verifyJwt],
      schema: {
        description: 'Submit user feedback',
        tags: [feedbackTag],
        body: createFeedbackBodySchema,
        response: createFeedbackResponseSchema,
        security: [{ bearerAuth: [] }],
      },
      handler: createFeedbackController,
    })
  )
}
