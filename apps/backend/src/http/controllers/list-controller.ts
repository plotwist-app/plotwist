import type { FastifyReply, FastifyRequest } from 'fastify'
import { DomainError } from '@/domain/errors/domain-error'
import { createList } from '@/domain/services/lists/create-list'
import { deleteListService } from '@/domain/services/lists/delete-list'
import { getListService } from '@/domain/services/lists/get-list'
import { getListProgressService } from '@/domain/services/lists/get-list-progress'
import { getListsServices } from '@/domain/services/lists/get-lists'
import { updateListService } from '@/domain/services/lists/update-list'
import { updateListBannerService } from '@/domain/services/lists/update-list-banner'
import { createUserActivity } from '@/domain/services/user-activities/create-user-activity'
import {
  createListBodySchema,
  deleteListParamsSchema,
  getListParamsSchema,
  getListsQuerySchema,
  updateListBannerBodySchema,
  updateListBodySchema,
  updateListParamsSchema,
} from '../schemas/lists'

export async function createListController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { title, description, visibility } = createListBodySchema.parse(
    request.body
  )

  const result = await createList({
    title,
    description,
    userId: request.user.id,
    visibility,
  })

  if (result instanceof Error) {
    return reply.status(result.status).send({ message: result.message })
  }

  await createUserActivity({
    activityType: 'CREATE_LIST',
    entityId: result.list.id,
    userId: result.list.userId,
    entityType: 'LIST',
  })

  return reply.status(201).send({ list: result.list })
}

export async function getListsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { userId, limit, visibility, hasBanner } = getListsQuerySchema.parse(
    request.query
  )

  const result = await getListsServices({
    userId,
    authenticatedUserId: request.user?.id,
    limit: limit,
    visibility,
    hasBanner,
  })

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  return reply.status(200).send({ lists: result.lists })
}

export async function deleteListController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = deleteListParamsSchema.parse(request.params)
  const result = await deleteListService({ id, userId: request.user.id })

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  return reply.status(204).send()
}

export async function updateListController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = updateListParamsSchema.parse(request.params)
  const values = updateListBodySchema.parse(request.body)

  const result = await updateListService({
    id: id,
    userId: request.user.id,
    values: values,
  })

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  return reply.status(200).send({ list: result.list })
}

export async function getListController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = getListParamsSchema.parse(request.params)

  const result = await getListService({
    id: id,
    authenticatedUserId: request.user?.id,
  })

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  return reply.status(200).send({ list: result.list })
}

export async function updateListBannerController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { listId, bannerUrl } = updateListBannerBodySchema.parse(request.body)

  const result = await updateListBannerService({
    listId,
    bannerUrl,
    userId: request.user.id,
  })

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  return reply.status(200).send({ list: result.list })
}

export async function getListProgressController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = getListParamsSchema.parse(request.params)

  const result = await getListProgressService({
    id: id,
    authenticatedUserId: request.user?.id,
  })

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  return reply.status(200).send(result)
}
