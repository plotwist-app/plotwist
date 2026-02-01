import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifyMultipart from '@fastify/multipart'
import fastifyRedis from '@fastify/redis'
import fastifySwaggerUi from '@fastify/swagger-ui'

import type { FastifyInstance } from 'fastify'

import { config } from '@/config'
import { followsRoutes } from './follow'
import { healthCheck } from './healthcheck'
import { imagesRoutes } from './images'
import { importRoutes } from './import'
import { likesRoutes } from './likes'
import { listItemRoute } from './list-item'
import { listsRoute } from './lists'
import { loginRoute } from './login'
import { reviewRepliesRoute } from './review-replies'
import { reviewsRoute } from './reviews'
import { socialAuthRoutes } from './social-auth'
import { socialLinksRoute } from './social-links'
import { subscriptionsRoutes } from './subscriptions'
import { userActivitiesRoutes } from './user-activities'
import { userEpisodesRoutes } from './user-episodes'
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
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })

  app.register(fastifyJwt, {
    secret: config.app.JWT_SECRET,
  })

  app.register(fastifyMultipart)

  app.register(fastifyRedis, {
    url: config.redis.REDIS_URL,
  })

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
  app.register(subscriptionsRoutes)
  app.register(watchEntriesRoutes)
  // app.register(userRecommendationsRoutes)

  return
}

function getCorsOrigin() {
  if (config.app.APP_ENV !== 'production') {
    return true // Permite todas as origens em dev/test
  }

  // Em produção, permite múltiplas origens
  const allowedOrigins = [
    config.app.CLIENT_URL,
    'https://plotwist.app',
    'https://www.plotwist.app',
  ]

  // Remove duplicatas caso CLIENT_URL já seja plotwist.app
  const uniqueOrigins = [...new Set(allowedOrigins)]

  return (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    // Apps nativos (iOS/Android) podem não enviar header Origin
    // Nesse caso, permitimos a requisição
    if (!origin) {
      callback(null, true)
      return
    }

    if (uniqueOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'), false)
    }
  }
}
