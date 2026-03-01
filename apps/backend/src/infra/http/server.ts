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
import { setRequestClient } from '@/infra/http/middlewares/set-request-client'
import { registerHttpRequestMetrics } from '@/infra/telemetry/http-request-metrics'
import { fastifyOtel } from '@/infra/telemetry/otel'
import { routes } from './routes'
import { transformSwaggerSchema } from './transform-schema'

const app: FastifyInstance = fastify()

function getUserId(request: { user?: { id: string } }): string | undefined {
  return request.user?.id
}

export async function startServer() {
  await app.register(fastifyOtel.plugin())

  app.addHook('onRequest', setRequestClient)

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
        logger.error(
          { err: err instanceof Error ? err : new Error(String(err)) },
          'Swagger schema transform failed'
        )
        return schema
      }
    },
  })

  app.setErrorHandler((error, request, reply) => {
    const userId = getUserId(request as { user?: { id: string } })
    if (error instanceof ZodError) {
      logger.warn(
        {
          err: error,
          method: request.method,
          url: request.url,
          route: request.routeOptions?.url,
          statusCode: 400,
          userId,
        },
        'HTTP 400: Validation error'
      )
      return reply
        .status(400)
        .send({ message: 'Validation error.', issues: error.format() })
    }

    if (error instanceof DomainError && error.status === 429) {
      logger.warn(
        {
          method: request.method,
          url: request.url,
          route: request.routeOptions?.url,
          statusCode: 429,
          userId: getUserId(request as { user?: { id: string } }),
        },
        'HTTP 429: Rate limit'
      )
      return reply
        .code(429)
        .send({ message: 'You hit the rate limit! Slow down please!' })
    }

    if (
      typeof (error as { statusCode?: number }).statusCode === 'number' &&
      (error as { statusCode: number }).statusCode === 429
    ) {
      if (!reply.sent) {
        logger.warn(
          {
            method: request.method,
            url: request.url,
            route: request.routeOptions?.url,
            statusCode: 429,
            userId: getUserId(request as { user?: { id: string } }),
          },
          'HTTP 429: Rate limit'
        )
        return reply
          .code(429)
          .send(
            (error as { message?: string }).message ?? 'Rate limit exceeded.'
          )
      }
      return
    }

    ;(request as { _serverError?: unknown })._serverError = error
    logger.error(
      {
        err: error instanceof Error ? error : new Error(String(error)),
        method: request.method,
        url: request.url,
        route: request.routeOptions?.url,
        statusCode: 500,
        userId: getUserId(request as { user?: { id: string } }),
      },
      'HTTP 500: Internal server error'
    )
    return reply.status(500).send({ message: 'Internal server error.' })
  })

  app.addHook('onResponse', (request, reply, done) => {
    const span = trace.getActiveSpan()
    if (span) {
      if (reply.statusCode >= 500) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: `HTTP ${reply.statusCode}`,
        })
        span.setAttribute('error', true)
        span.setAttribute('http.response.status_code', reply.statusCode)
        span.setAttribute('error.type', String(reply.statusCode))

        const serverError = (request as { _serverError?: unknown })._serverError
        if (serverError instanceof Error) {
          span.setAttribute('exception.type', serverError.name)
          span.setAttribute('exception.message', serverError.message)
          if (serverError.stack) {
            span.setAttribute('exception.stacktrace', serverError.stack)
          }
          span.recordException(serverError)
        }
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
