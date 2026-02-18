import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { withTracing } from '@/infra/telemetry/with-tracing'

import {
  appleAuthController,
  googleAuthController,
} from '../controllers/social-auth-controller'
import {
  appleAuthBodySchema,
  googleAuthBodySchema,
  socialAuthResponseSchema,
} from '../schemas/social-auth'

export async function socialAuthRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/auth/apple',
    schema: {
      description: 'Sign in or sign up with Apple',
      tags: ['Auth'],
      body: appleAuthBodySchema,
      response: socialAuthResponseSchema,
    },
    handler: withTracing('apple-auth', (request, reply) =>
    appleAuthController(request, reply, app)
  ),
  })

  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/auth/google',
    schema: {
      description: 'Sign in or sign up with Google',
      tags: ['Auth'],
      body: googleAuthBodySchema,
      response: socialAuthResponseSchema,
    },
    handler: withTracing('google-auth', (request, reply) =>
    googleAuthController(request, reply, app)
  ),
  })
}
