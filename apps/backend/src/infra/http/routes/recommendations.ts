import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import {
  getReceivedRecommendationsController,
  respondRecommendationController,
  sendRecommendationController,
} from '../controllers/recommendations-controller'
import { verifyJwt } from '../middlewares/verify-jwt'
import {
  getRecommendationsQuerySchema,
  respondRecommendationBodySchema,
  respondRecommendationParamsSchema,
  sendRecommendationBodySchema,
} from '../schemas/recommendations'

const TAGS = ['Recommendations']

export async function userRecommendationsRoutes(app: FastifyInstance) {
  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/recommendations',
      onRequest: [verifyJwt],
      schema: {
        description: 'Send a recommendation to a user',
        tags: TAGS,
        security: [{ bearerAuth: [] }],
        body: sendRecommendationBodySchema,
      },
      handler: sendRecommendationController,
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/recommendations',
      onRequest: [verifyJwt],
      schema: {
        description: 'Get received recommendations with TMDB data',
        tags: TAGS,
        security: [{ bearerAuth: [] }],
        querystring: getRecommendationsQuerySchema,
      },
      handler: (request, reply) =>
        getReceivedRecommendationsController(request, reply, app.redis),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'PUT',
      url: '/recommendations/:id',
      onRequest: [verifyJwt],
      schema: {
        description: 'Accept or decline a recommendation',
        tags: TAGS,
        security: [{ bearerAuth: [] }],
        params: respondRecommendationParamsSchema,
        body: respondRecommendationBodySchema,
      },
      handler: respondRecommendationController,
    })
  )
}
