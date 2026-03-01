import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import {
  createReviewController,
  deleteReviewController,
  getDetailedReviewsController,
  getReviewController,
  getReviewsController,
  updateReviewController,
} from '../controllers/review-controller'
import { verifyJwt } from '../middlewares/verify-jwt'
import { verifyOptionalJwt } from '../middlewares/verify-optional-jwt'
import {
  createReviewBodySchema,
  createReviewResponseSchema,
  getDetailedReviewsResponseSchema,
  getReviewQuerySchema,
  getReviewResponseSchema,
  getReviewsQuerySchema,
  getReviewsResponseSchema,
  reviewParamsSchema,
  updateReviewBodySchema,
  updateReviewResponse,
} from '../schemas/reviews'

export async function reviewsRoute(app: FastifyInstance) {
  const reviewsTag = 'Reviews'

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/review',
      onRequest: [verifyJwt],
      schema: {
        description: 'Create a review',
        tags: [reviewsTag],
        body: createReviewBodySchema,
        response: createReviewResponseSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      handler: (request, reply) =>
        createReviewController(request, reply, app.redis),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/reviews',
      onRequest: [verifyOptionalJwt],
      schema: {
        description: 'Get reviews',
        tags: [reviewsTag],
        querystring: getReviewsQuerySchema,
        response: getReviewsResponseSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      handler: getReviewsController,
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'DELETE',
      url: '/review/by/:id',
      schema: {
        description: 'Delete review by id',
        tags: [reviewsTag],
        params: reviewParamsSchema,
      },
      handler: (request, reply) =>
        deleteReviewController(request, reply, app.redis),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'PUT',
      url: '/review/by/:id',
      schema: {
        description: 'Update review by id',
        tags: [reviewsTag],
        params: reviewParamsSchema,
        body: updateReviewBodySchema,
        response: updateReviewResponse,
      },
      handler: (request, reply) =>
        updateReviewController(request, reply, app.redis),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/detailed/reviews',
      schema: {
        operationId: 'getDetailedReviews',
        description: 'Get detailed reviews',
        tags: [reviewsTag],
        query: getReviewsQuerySchema,
        response: getDetailedReviewsResponseSchema,
      },
      handler: (request, reply) =>
        getDetailedReviewsController(request, reply, app.redis),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/review',
      onRequest: [verifyJwt],
      schema: {
        description: 'Get review',
        tags: [reviewsTag],
        querystring: getReviewQuerySchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
        response: getReviewResponseSchema,
      },
      handler: getReviewController,
    })
  )
}
