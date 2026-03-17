import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import {
  getUserAIRecommendationsController,
  getUserBestReviewsController,
  getUserItemsStatusController,
  getUserMostWatchedSeriesController,
  getUserRatingInsightsController,
  getUserReviewsCountController,
  getUserStatsController,
  getUserStatsTimelineController,
  getUserTasteDNAController,
  getUserTotalHoursController,
  getUserViewerProfileController,
  getUserWatchedCastController,
  getUserWatchedCountriesController,
  getUserWatchedGenresController,
} from '../controllers/user-stats'
import {
  languageQuerySchema,
  languageWithLimitAndPeriodQuerySchema,
  languageWithPeriodQuerySchema,
  periodQuerySchema,
  timelineQuerySchema,
} from '../schemas/common'
import {
  getUserAIRecommendationsResponseSchema,
  getUserBestReviewsResponseSchema,
  getUserDefaultSchema,
  getUserItemsStatusResponseSchema,
  getUserMostWatchedSeriesResponseSchema,
  getUserRatingInsightsResponseSchema,
  getUserReviewsCountResponseSchema,
  getUserStatsResponseSchema,
  getUserStatsTimelineResponseSchema,
  getUserTasteDNAResponseSchema,
  getUserTotalHoursResponseSchema,
  getUserViewerProfileResponseSchema,
  getUserWatchedCastResponseSchema,
  getUserWatchedCountriesResponseSchema,
  getUserWatchedGenresResponseSchema,
} from '../schemas/user-stats'

const USER_STATS_TAG = ['User stats']

export async function userStatsRoutes(app: FastifyInstance) {
  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/user/:id/stats',
      schema: {
        description: 'Get user stats',
        params: getUserDefaultSchema,
        response: getUserStatsResponseSchema,
        tags: USER_STATS_TAG,
      },
      handler: getUserStatsController,
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/user/:id/stats-timeline',
      schema: {
        description: 'Get user stats timeline (paginated monthly sections)',
        params: getUserDefaultSchema,
        query: timelineQuerySchema,
        response: getUserStatsTimelineResponseSchema,
        tags: USER_STATS_TAG,
      },
      handler: (request, reply) =>
        getUserStatsTimelineController(request, reply, app.redis),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/user/:id/total-hours',
      schema: {
        description: 'Get user total hours',
        params: getUserDefaultSchema,
        query: periodQuerySchema,
        response: getUserTotalHoursResponseSchema,
        tags: USER_STATS_TAG,
      },
      handler: (request, reply) =>
        getUserTotalHoursController(request, reply, app.redis),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/user/:id/reviews-count',
      schema: {
        description: 'Get user reviews count',
        params: getUserDefaultSchema,
        response: getUserReviewsCountResponseSchema,
        tags: USER_STATS_TAG,
      },
      handler: getUserReviewsCountController,
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/user/:id/most-watched-series',
      schema: {
        description: 'Get user most watched series',
        params: getUserDefaultSchema,
        query: languageWithPeriodQuerySchema,
        response: getUserMostWatchedSeriesResponseSchema,
        tags: USER_STATS_TAG,
      },
      handler: (request, reply) =>
        getUserMostWatchedSeriesController(request, reply, app.redis),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/user/:id/watched-genres',
      schema: {
        description: 'Get user watched genres',
        params: getUserDefaultSchema,
        query: languageWithPeriodQuerySchema,
        response: getUserWatchedGenresResponseSchema,
        tags: USER_STATS_TAG,
      },
      handler: (request, reply) =>
        getUserWatchedGenresController(request, reply, app.redis),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/user/:id/watched-cast',
      schema: {
        description: 'Get user watched cast',
        params: getUserDefaultSchema,
        query: periodQuerySchema,
        response: getUserWatchedCastResponseSchema,
        tags: USER_STATS_TAG,
      },
      handler: (request, reply) =>
        getUserWatchedCastController(request, reply, app.redis),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/user/:id/watched-countries',
      schema: {
        description: 'Get user watched countries',
        params: getUserDefaultSchema,
        query: languageWithPeriodQuerySchema,
        response: getUserWatchedCountriesResponseSchema,
        tags: USER_STATS_TAG,
      },
      handler: (request, reply) =>
        getUserWatchedCountriesController(request, reply, app.redis),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/user/:id/best-reviews',
      schema: {
        description: 'Get user best reviews',
        params: getUserDefaultSchema,
        query: languageWithLimitAndPeriodQuerySchema,
        response: getUserBestReviewsResponseSchema,
        tags: USER_STATS_TAG,
      },
      handler: (request, reply) =>
        getUserBestReviewsController(request, reply, app.redis),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/user/:id/items-status',
      schema: {
        description: 'Get user items status',
        params: getUserDefaultSchema,
        query: periodQuerySchema,
        response: getUserItemsStatusResponseSchema,
        tags: USER_STATS_TAG,
      },
      handler: (request, reply) =>
        getUserItemsStatusController(request, reply, app.redis),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/user/:id/rating-insights',
      schema: {
        description: 'Get user rating insights',
        params: getUserDefaultSchema,
        query: periodQuerySchema,
        response: getUserRatingInsightsResponseSchema,
        tags: USER_STATS_TAG,
      },
      handler: (request, reply) =>
        getUserRatingInsightsController(request, reply, app.redis),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/user/:id/viewer-profile',
      schema: {
        description: 'Get AI-generated viewer profile',
        params: getUserDefaultSchema,
        query: languageQuerySchema,
        response: getUserViewerProfileResponseSchema,
        tags: USER_STATS_TAG,
      },
      handler: (request, reply) =>
        getUserViewerProfileController(request, reply, app.redis),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/user/:id/ai-recommendations',
      schema: {
        description: 'Get AI-powered recommendations',
        params: getUserDefaultSchema,
        query: languageWithPeriodQuerySchema,
        response: getUserAIRecommendationsResponseSchema,
        tags: USER_STATS_TAG,
      },
      handler: (request, reply) =>
        getUserAIRecommendationsController(request, reply, app.redis),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/user/:id/taste-dna',
      schema: {
        description: 'Get AI-powered taste DNA analysis',
        params: getUserDefaultSchema,
        query: languageWithPeriodQuerySchema,
        response: getUserTasteDNAResponseSchema,
        tags: USER_STATS_TAG,
      },
      handler: (request, reply) =>
        getUserTasteDNAController(request, reply, app.redis),
    })
  )
}
