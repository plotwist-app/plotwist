import fastifyRateLimit from '@fastify/rate-limit'
import type { FastifyInstance } from 'fastify'
import { config } from '@/config'

export function registerRateLimit(app: FastifyInstance) {
  app.register(async instance => {
    await instance.register(fastifyRateLimit, {
      redis: instance.redis,
      max: config.app.RATE_LIMIT_MAX,
      timeWindow: config.app.RATE_LIMIT_TIME_WINDOW_MS,
      skipOnError: true,
      errorResponseBuilder: (_request: unknown, context: { after: string }) => ({
        statusCode: 429,
        error: 'Too Many Requests',
        message: `Rate limit exceeded, retry in ${Math.ceil(Number(context.after) / 1000)} seconds`,
      }),
    })
  })
}
