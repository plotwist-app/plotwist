import { DomainError } from '@/domain/errors/domain-error'
import { loginService } from '@/domain/services/login/login'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { loginBodySchema } from '../schemas/login'

export async function loginController(
  request: FastifyRequest,
  reply: FastifyReply,
  app: FastifyInstance
) {
  const { login, password } = loginBodySchema.parse(request.body)

  const result = await loginService({
    login,
    password,
    url: `${request.protocol}://${request.hostname}`,
  })

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  if (result.status) {
    return reply.status(201).send({ status: result.status })
  }

  if (result.user) {
    const token = app.jwt.sign({ id: result.user.id })
    return reply.status(200).send({ token })
  }
}
