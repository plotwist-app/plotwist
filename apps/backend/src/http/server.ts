import * as fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fastifySwagger from '@fastify/swagger'
import fastify from 'fastify'
import type { FastifyInstance } from 'fastify/types/instance'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { ZodError } from 'zod'
import { logger } from '@/adapters/logger'
import { config } from '../config'
import { routes } from './routes'
import { transformSwaggerSchema } from './transform-schema'

const app: FastifyInstance = buildFastifyInstance()

export function startServer() {
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

    if (error.statusCode === 429) {
      return reply
        .code(429)
        .send({ message: 'You hit the rate limit! Slow down please!' })
    }

    console.error({ error })
    return reply.status(500).send({ message: 'Internal server error.' })
  })

  routes(app)

  app
    .listen({
      port: config.app.PORT,
      host: '0.0.0.0',
    })
    .then(() => {
      logger.info(`HTTP server running at ${config.app.BASE_URL}`)
    })
}

export function buildFastifyInstance() {
  if (config.featureFlags.ENABLE_CERTS === 'true') {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)

    const CERT_CA = path.join(__dirname, '../../certs/ca.pem')
    const CERT_KEY = path.join(__dirname, '../../certs/server.key')
    const CERT_CRT = path.join(__dirname, '../../certs/server.crt')

    return fastify({
      https: {
        key: fs.readFileSync(CERT_KEY),
        cert: fs.readFileSync(CERT_CRT),
        ca: fs.readFileSync(CERT_CA),
        requestCert: true,
        rejectUnauthorized: true,
      },
    })
  }

  return fastify()
}
