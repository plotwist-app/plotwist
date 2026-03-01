import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { DomainError } from '@/domain/errors/domain-error'
import { appleAuthService } from '@/domain/services/social-auth/apple-auth'
import { googleAuthService } from '@/domain/services/social-auth/google-auth'
import { createUserActivity } from '@/domain/services/user-activities/create-user-activity'
import {
  appleAuthBodySchema,
  googleAuthBodySchema,
} from '../schemas/social-auth'

export async function appleAuthController(
  request: FastifyRequest,
  reply: FastifyReply,
  app: FastifyInstance
) {
  const body = appleAuthBodySchema.parse(request.body)

  const result = await appleAuthService({
    identityToken: body.identityToken,
    authorizationCode: body.authorizationCode,
    email: body.email,
    fullName: body.fullName,
  })

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  // Create activity for new users
  if (result.isNewUser) {
    await createUserActivity({
      userId: result.user.id,
      activityType: 'CREATE_ACCOUNT',
    })
  }

  const token = app.jwt.sign({ id: result.user.id })

  return reply.status(200).send({
    token,
    isNewUser: result.isNewUser,
    needsUsername: result.needsUsername,
  })
}

export async function googleAuthController(
  request: FastifyRequest,
  reply: FastifyReply,
  app: FastifyInstance
) {
  const body = googleAuthBodySchema.parse(request.body)

  const result = await googleAuthService({
    idToken: body.idToken,
  })

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  // Create activity for new users
  if (result.isNewUser) {
    await createUserActivity({
      userId: result.user.id,
      activityType: 'CREATE_ACCOUNT',
    })
  }

  const token = app.jwt.sign({ id: result.user.id })

  return reply.status(200).send({
    token,
    isNewUser: result.isNewUser,
    needsUsername: result.needsUsername,
  })
}
