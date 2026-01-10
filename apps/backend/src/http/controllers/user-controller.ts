import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  checkAvailableUsernameQuerySchema,
  createUserBodySchema,
  getUserByIdParamsSchema,
  getUserByUsernameParamsSchema,
  isEmailAvailableQuerySchema,
  searchUsersByUsernameQuerySchema,
  updateUserBodySchema,
  updateUserPasswordBodySchema,
  updateUserPreferencesBodySchema,
} from '../schemas/users'

import { DomainError } from '@/domain/errors/domain-error'
import { createUserActivity } from '@/domain/services/user-activities/create-user-activity'
import { getUserPreferencesService } from '@/domain/services/user-preferences/get-user-preferences'
import { updateUserPreferencesService } from '@/domain/services/user-preferences/update-user-preferences'
import { createUser } from '@/domain/services/users/create-user'
import { getUserById } from '@/domain/services/users/get-by-id'
import { getUserByUsername } from '@/domain/services/users/get-user-by-username'
import { isEmailAvailable } from '@/domain/services/users/is-email-available'
import { checkAvailableUsername } from '@/domain/services/users/is-username-available'
import { searchUsersByUsername } from '@/domain/services/users/search-users-by-username'
import { updateUserService } from '@/domain/services/users/update-user'
import { updatePasswordService } from '@/domain/services/users/update-user-password'

export async function createUserController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { username, email, password } = createUserBodySchema.parse(request.body)

  const result = await createUser({ username, email, password })

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  await createUserActivity({
    userId: result.user.id,
    activityType: 'CREATE_ACCOUNT',
  })

  return reply.status(201).send({ user: result.user })
}

export async function isUsernameAvailableController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { username } = checkAvailableUsernameQuerySchema.parse(request.query)
  const result = await checkAvailableUsername({ username })

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  return reply.status(200).send({ available: result.available })
}

export async function isEmailAvailableController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { email } = isEmailAvailableQuerySchema.parse(request.query)
  const result = await isEmailAvailable({ email })

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  return reply.status(200).send({ available: result.available })
}

export async function getUserByUsernameController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { username } = getUserByUsernameParamsSchema.parse(request.params)
  const result = await getUserByUsername({ username })

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  return reply.status(200).send({ user: result.user })
}

export async function getUserByIdController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = getUserByIdParamsSchema.parse(request.params)
  const result = await getUserById(id)

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  return reply.status(200).send({ user: result.user })
}

export async function getMeController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const result = await getUserById(request.user.id)

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  return reply.status(200).send({ user: result.user })
}

export async function updateUserController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const values = updateUserBodySchema.parse(request.body)

  const result = await updateUserService({
    userId: request.user.id,
    ...values,
  })

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  return reply.status(200).send({ user: result.user })
}

export async function updateUserPasswordController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { password, token } = updateUserPasswordBodySchema.parse(request.body)
  const { status } = await updatePasswordService({ password, token })

  return reply.status(200).send({ status: status })
}

export async function updateUserPreferencesController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const values = updateUserPreferencesBodySchema.parse(request.body)

  const result = await updateUserPreferencesService({
    userId: request.user.id,
    ...values,
  })

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  return reply.status(200).send(result)
}

export async function getUserPreferencesController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const result = await getUserPreferencesService({ userId: request.user.id })

  return reply.status(200).send(result)
}

export async function searchUsersByUsernameController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { username } = searchUsersByUsernameQuerySchema.parse(request.query)

  const result = await searchUsersByUsername(username)

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  return reply.status(200).send({ users: result })
}
