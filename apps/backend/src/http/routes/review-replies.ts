import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import {
  createReviewReplyController,
  deleteReviewReplyController,
  getReviewRepliesController,
  updateReviewReplyController,
} from '../controllers/review-replies-controller'
import { verifyJwt } from '../middlewares/verify-jwt'
import { verifyOptionalJwt } from '../middlewares/verify-optional-jwt'
import {
  createReviewReplyBodySchema,
  createReviewReplyResponseSchema,
  getReviewRepliesQuerySchema,
  getReviewRepliesResponseSchema,
  reviewReplyParamsSchema,
  updateReviewReplyBodySchema,
  updateReviewReplyResponseSchema,
} from '../schemas/review-replies'

export async function reviewRepliesRoute(app: FastifyInstance) {
  const reviewRepliesTag = 'Review Replies'

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/review-reply',
      onRequest: [verifyJwt],
      schema: {
        description: 'Create a review reply',
        tags: [reviewRepliesTag],
        body: createReviewReplyBodySchema,
        response: createReviewReplyResponseSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      handler: createReviewReplyController,
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/review-replies',
      onRequest: [verifyOptionalJwt],
      schema: {
        description: 'Get review replies',
        tags: [reviewRepliesTag],
        querystring: getReviewRepliesQuerySchema,
        response: getReviewRepliesResponseSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      handler: getReviewRepliesController,
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'DELETE',
      url: '/review-reply/by/:id',
      onRequest: [verifyJwt],
      schema: {
        description: 'Delete review reply by id',
        tags: [reviewRepliesTag],
        params: reviewReplyParamsSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      handler: deleteReviewReplyController,
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'PUT',
      url: '/review-reply/by/:id',
      onRequest: [verifyJwt],
      schema: {
        description: 'Update review reply by id',
        tags: [reviewRepliesTag],
        params: reviewReplyParamsSchema,
        body: updateReviewReplyBodySchema,
        response: updateReviewReplyResponseSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      handler: updateReviewReplyController,
    })
  )
}
