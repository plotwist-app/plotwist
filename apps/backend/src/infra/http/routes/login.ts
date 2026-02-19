import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { loginController } from '../controllers/login-controller'
import { loginBodySchema, loginResponseSchema } from '../schemas/login'

export async function loginRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/login',
    schema: {
      description: 'User login with login and password',
      tags: ['Auth'],
      body: loginBodySchema,
      response: loginResponseSchema,
    },
    handler: (request, reply) => loginController(request, reply, app),
  })
}
