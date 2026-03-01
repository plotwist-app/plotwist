import fastifySwagger from '@fastify/swagger'
import { SpanStatusCode, trace } from '@opentelemetry/api'
import fastify from 'fastify'
import type { FastifyInstance } from 'fastify/types/instance'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { ZodError } from 'zod'
import { config } from '@/config'
import { DomainError } from '@/domain/errors/domain-error'
import { logger } from '@/infra/adapters/logger'
import { registerHttpRequestMetrics } from '@/infra/telemetry/http-request-metrics'
import { fastifyOtel } from '@/infra/telemetry/otel'
import { routes } from './routes'
import { transformSwaggerSchema } from './transform-schema'

const app: FastifyInstance = fastify()

export async function startServer() {
  await app.register(fastifyOtel.plugin())

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  app.register(fastifySwagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Plotwist',
        version: '0.1.0',
      },
      servers: [
        {
          url: config.app.BASE_URL,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    transform: schema => {
      try {
        return transformSwaggerSchema(schema)
      } catch (err) {
        if (err instanceof Error) {
          console.error({ error: err.message })
        }

        return schema
      }
    },
  })

  app.setErrorHandler((error, _, reply) => {
    if (error instanceof ZodError) {
      return reply
        .status(400)
        .send({ message: 'Validation error.', issues: error.format() })
    }

    if (error instanceof DomainError && error.status === 429) {
      return reply
        .code(429)
        .send({ message: 'You hit the rate limit! Slow down please!' })
    }

    if (
      typeof (error as { statusCode?: number }).statusCode === 'number' &&
      (error as { statusCode: number }).statusCode === 429
    ) {
      if (!reply.sent) {
        return reply
          .code(429)
          .send(
            (error as { message?: string }).message ?? 'Rate limit exceeded.'
          )
      }
      return
    }

    console.error({ error })
    return reply.status(500).send({ message: 'Internal server error.' })
  })

  app.addHook('onResponse', (_request, reply, done) => {
    const span = trace.getActiveSpan()
    if (span) {
      if (reply.statusCode >= 500) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: `HTTP ${reply.statusCode}`,
        })
      } else {
        span.setStatus({ code: SpanStatusCode.OK })
      }
    }
    done()
  })

  registerHttpRequestMetrics(app)

  // TODO: Uncomment this when we have a client guard
  // registerClientGuard(app)
  routes(app)

  await app.listen({
    port: config.app.PORT,
    host: '0.0.0.0',
  })
  logger.info(`HTTP server running at ${config.app.BASE_URL}`)
}
