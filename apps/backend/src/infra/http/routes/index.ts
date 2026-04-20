import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifyMultipart from '@fastify/multipart'
import fastifyRedis from '@fastify/redis'
import fastifySwaggerUi from '@fastify/swagger-ui'

import type { FastifyInstance } from 'fastify'

import { config } from '@/config'
import { setInitialCounterValue } from '@/domain/services/shared-urls/set-initial-counter-value'
import { sharedUrlCounterFactory } from '@/infra/factories/shared-url-counter-factory'
import { registerRateLimit } from '../rate-limit'
import { achievementsRoutes } from './achievements'
import { feedbackRoutes } from './feedback'
import { followsRoutes } from './follow'
import { healthCheck } from './healthcheck'
import { imagesRoutes } from './images'
import { importRoutes } from './import'
import { likesRoutes } from './likes'
import { listItemRoute } from './list-item'
import { listsRoute } from './lists'
import { loginRoute } from './login'
import { userRecommendationsRoutes } from './recommendations'
import { reviewRepliesRoute } from './review-replies'
import { reviewsRoute } from './reviews'
import { sharedUrlRoute } from './shared-url'
import { socialAuthRoutes } from './social-auth'
import { socialLinksRoute } from './social-links'
import { subscriptionsRoutes } from './subscriptions'
import { tmdbProxyRoutes } from './tmdb-proxy'
import { userActivitiesRoutes } from './user-activities'
import { userEpisodesRoutes } from './user-episodes'
import { userFavoritesRoutes } from './user-favorites'
import { userItemsRoutes } from './user-items'
import { userStatsRoutes } from './user-stats'
import { usersRoute } from './users'
import { watchEntriesRoutes } from './watch-entries'
import { webhookRoutes } from './webhook'

export function routes(app: FastifyInstance) {
  if (config.app.APP_ENV === 'dev') {
    app.register(fastifySwaggerUi, {
      routePrefix: '/api-docs',
    })
  }

  app.register(fastifyCors, {
    origin: getCorsOrigin(),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Client-Token',
      'X-Client',
    ],
    credentials: true,
    strictPreflight: false,
  })

  app.register(fastifyJwt, {
    secret: config.app.JWT_SECRET,
  })

  app.register(fastifyMultipart)

  app.register(fastifyRedis, {
    url: config.redis.REDIS_URL,
  })

  app.addHook('onReady', async () => {
    const counter = sharedUrlCounterFactory(
      app.redis,
      config.sharedUrls.SHARED_URLS_COUNTER_KEY
    )
    await setInitialCounterValue(
      counter,
      config.sharedUrls.SHARED_URLS_COUNTER_START_VAL - 1
    )
  })

  registerRateLimit(app)

  app.register(usersRoute)
  app.register(listsRoute)
  app.register(loginRoute)
  app.register(socialAuthRoutes)
  app.register(healthCheck)
  app.register(reviewsRoute)
  app.register(listItemRoute)
  app.register(userItemsRoutes)
  app.register(webhookRoutes)
  app.register(reviewRepliesRoute)
  app.register(socialLinksRoute)
  app.register(userEpisodesRoutes)
  app.register(likesRoutes)
  app.register(userStatsRoutes)
  app.register(imagesRoutes)
  app.register(followsRoutes)
  app.register(importRoutes)
  app.register(userActivitiesRoutes)
  app.register(sharedUrlRoute)
  app.register(subscriptionsRoutes)
  app.register(watchEntriesRoutes)
  app.register(tmdbProxyRoutes)
  app.register(feedbackRoutes)
  app.register(userFavoritesRoutes)
  app.register(userRecommendationsRoutes)
  app.register(achievementsRoutes)

  return
}

function getCorsOrigin(): true | string[] {
  if (config.app.APP_ENV !== 'production') {
    return true
  }

  const allowedOrigins = [
    config.app.CLIENT_URL,
    'https://plotwist.app',
    'https://www.plotwist.app',
  ]

  return [...new Set(allowedOrigins)]
}
