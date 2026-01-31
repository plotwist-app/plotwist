import type { FastifyRedis } from '@fastify/redis'
import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  createWatchEntry,
  deleteWatchEntriesByUserItemId,
  getWatchEntriesByUserItemId,
} from '@/db/repositories/user-watch-entries-repository'
import { DomainError } from '@/domain/errors/domain-error'
import { getTMDBDataService } from '@/domain/services/tmdb/get-tmdb-data'
import { createUserActivity } from '@/domain/services/user-activities/create-user-activity'
import { createUserItemEpisodesService } from '@/domain/services/user-items/create-user-item-episodes'
import { deleteUserItemService } from '@/domain/services/user-items/delete-user-item'
import { deleteUserItemEpisodesService } from '@/domain/services/user-items/delete-user-item-episodes'
import { getAllUserItemsService } from '@/domain/services/user-items/get-all-user-items'
import { getUserItemService } from '@/domain/services/user-items/get-user-item'
import { getUserItemsService } from '@/domain/services/user-items/get-user-items'
import { getUserItemsCountService } from '@/domain/services/user-items/get-user-items-count'
import { upsertUserItemService } from '@/domain/services/user-items/upsert-user-item'
import {
  deleteUserItemParamsSchema,
  getAllUserItemsQuerySchema,
  getUserItemQuerySchema,
  getUserItemsBodySchema,
  getUserItemsCountQuerySchema,
  upsertUserItemBodySchema,
} from '../schemas/user-items'

export async function upsertUserItemController(
  request: FastifyRequest,
  reply: FastifyReply,
  redis: FastifyRedis
) {
  const { tmdbId, mediaType, status } = upsertUserItemBodySchema.parse(
    request.body
  )

  const result = await upsertUserItemService({
    tmdbId,
    mediaType,
    status,
    userId: request.user.id,
  })

  if (mediaType === 'TV_SHOW' && status === 'WATCHED') {
    await createUserItemEpisodesService({
      redis,
      tmdbId,
      userId: request.user.id,
    })
  }

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  // Create first watch entry if status is WATCHED and no entries exist
  if (status === 'WATCHED') {
    const existingEntries = await getWatchEntriesByUserItemId(result.userItem.id)
    if (existingEntries.length === 0) {
      await createWatchEntry({ userItemId: result.userItem.id })
    }
  } else {
    // If status changed from WATCHED to something else, delete watch entries
    await deleteWatchEntriesByUserItemId(result.userItem.id)
  }

  await createUserActivity({
    userId: request.user.id,
    activityType: 'CHANGE_STATUS',
    metadata: {
      tmdbId,
      mediaType,
      status,
      userItemId: result.userItem.id,
    },
  })

  return reply.status(201).send({ userItem: result.userItem })
}

export async function getUserItemsController(
  request: FastifyRequest,
  reply: FastifyReply,
  redis: FastifyRedis
) {
  const input = getUserItemsBodySchema.parse(request.body)

  const [orderBy, orderDirection] = input.orderBy.split('.') as [
    'addedAt' | 'updatedAt' | 'rating',
    'asc' | 'desc',
  ]

  const { userItems, nextCursor } = await getUserItemsService({
    ...input,
    status: input.status === 'ALL' ? undefined : input.status,
    orderBy,
    orderDirection,
    rating: input.rating.map(Number),
    mediaType: input.mediaType as ['TV_SHOW', 'MOVIE'],
    pageSize: Number(input.pageSize),
    onlyItemsWithoutReview: input.onlyItemsWithoutReview,
  })

  const formattedUserItems = await Promise.all(
    userItems.map(async item => {
      const tmdbData = await getTMDBDataService(redis, {
        mediaType: item.mediaType,
        tmdbId: item.tmdbId,
        language: input.language || 'en-US',
      })

      return { ...item, ...tmdbData }
    })
  )

  return reply.status(200).send({ userItems: formattedUserItems, nextCursor })
}

export async function deleteUserItemController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = deleteUserItemParamsSchema.parse(request.params)

  const result = await deleteUserItemService(id)

  if (result instanceof DomainError) {
    return reply.status(result.status).send({ message: result.message })
  }

  const { deletedUserItem } = result

  await deleteUserItemEpisodesService({
    tmdbId: deletedUserItem.tmdbId,
    userId: deletedUserItem.userId,
  })

  return reply.send(204).send()
}

export async function getUserItemController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { mediaType, tmdbId } = getUserItemQuerySchema.parse(request.query)

  const result = await getUserItemService({
    mediaType,
    tmdbId: Number(tmdbId),
    userId: request.user.id,
  })

  // Include watch entries if user item exists
  if (result.userItem) {
    const watchEntries = await getWatchEntriesByUserItemId(result.userItem.id)
    return reply.status(200).send({
      userItem: {
        ...result.userItem,
        watchEntries: watchEntries.map(entry => ({
          id: entry.id,
          watchedAt: entry.watchedAt.toISOString(),
        })),
      },
    })
  }

  return reply.status(200).send(result)
}

export async function getAllUserItemsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { status, userId } = getAllUserItemsQuerySchema.parse(request.query)
  const result = await getAllUserItemsService({ status, userId })

  return reply.status(200).send(result)
}

export async function getUserItemsCountController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { userId } = getUserItemsCountQuerySchema.parse(request.query)
  const result = await getUserItemsCountService({ userId })

  return reply.status(200).send(result)
}
