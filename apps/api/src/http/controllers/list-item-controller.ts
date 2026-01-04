import { DomainError } from '@/domain/errors/domain-error'
import { createListItemService } from '@/domain/services/list-item/create-list-item'
import { deleteListItemService } from '@/domain/services/list-item/delete-list-item'
import { getListItemsService } from '@/domain/services/list-item/get-list-items'
import { updateListItemsService } from '@/domain/services/list-item/update-list-items'
import { getTMDBDataService } from '@/domain/services/tmdb/get-tmdb-data'
import type { FastifyRedis } from '@fastify/redis'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { languageQuerySchema } from '../schemas/common'
import {
  createListItemBodySchema,
  deleteListItemParamSchema,
  getListItemsParamsSchema,
  updateListItemsBodySchema,
} from '../schemas/list-item'

export async function createListItemController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const body = createListItemBodySchema.parse(request.body)
  const result = await createListItemService({ ...body }, request.user.id)

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  return reply.status(201).send({ listItem: result.listItem })
}

export async function getListItemsController(
  request: FastifyRequest,
  reply: FastifyReply,
  redis: FastifyRedis
) {
  const { listId } = getListItemsParamsSchema.parse(request.params)
  const { language } = languageQuerySchema.parse(request.query)

  const result = await getListItemsService({ listId })

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  const listItems = await Promise.all(
    result.listItems.map(async listItem => {
      try {
        const tmdbData = await getTMDBDataService(redis, {
          language: language || 'en-US',
          mediaType: listItem.mediaType,
          tmdbId: listItem.tmdbId,
        })

        return { ...listItem, ...tmdbData }
      } catch {
        return undefined
      }
    })
  )

  const validListItems = listItems.filter(item => item !== undefined)

  return reply.status(200).send(validListItems)
}

export async function deleteListItemController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = deleteListItemParamSchema.parse(request.params)

  const result = await deleteListItemService({
    id,
    userId: request.user.id,
  })

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  return reply.status(204).send()
}

export async function updateListItemController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { listItems } = updateListItemsBodySchema.parse(request.body)
  const result = await updateListItemsService({ listItems })

  return reply.status(200).send(result)
}
