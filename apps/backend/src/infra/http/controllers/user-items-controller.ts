import type { FastifyRedis } from '@fastify/redis'
import type { FastifyReply, FastifyRequest } from 'fastify'
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
import { reorderUserItemsService } from '@/domain/services/user-items/reorder-user-items'
import { upsertUserItemService } from '@/domain/services/user-items/upsert-user-item'
import { invalidateUserStatsCache } from '@/domain/services/user-stats/cache-utils'
import { logger } from '@/infra/adapters/logger'
import {
  createWatchEntry,
  deleteWatchEntriesByUserItemId,
  getWatchEntriesByUserItemId,
} from '@/infra/db/repositories/user-watch-entries-repository'
import {
  deleteUserItemParamsSchema,
  getAllUserItemsQuerySchema,
  getUserItemQuerySchema,
  getUserItemsBodySchema,
  getUserItemsCountQuerySchema,
  reorderUserItemsBodySchema,
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

  const upsertResult = await upsertUserItemService({
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

  if (upsertResult instanceof DomainError) {
    return reply
      .status(upsertResult.status)
      .send({ message: upsertResult.message })
  }

  // Create first watch entry if status is WATCHED and no entries exist
  let watchEntries: { id: string; watchedAt: string }[] = []
  if (status === 'WATCHED') {
    const existingEntries = await getWatchEntriesByUserItemId(
      upsertResult.userItem.id
    )
    if (existingEntries.length === 0) {
      await createWatchEntry({ userItemId: upsertResult.userItem.id })
    }
    // Fetch all watch entries to return in response
    const allEntries = await getWatchEntriesByUserItemId(
      upsertResult.userItem.id
    )
    watchEntries = allEntries.map(entry => ({
      id: entry.id,
      watchedAt: entry.watchedAt.toISOString(),
    }))
  } else {
    // If status changed from WATCHED to something else, delete watch entries
    await deleteWatchEntriesByUserItemId(upsertResult.userItem.id)
  }

  await createUserActivity({
    userId: request.user.id,
    activityType: 'CHANGE_STATUS',
    metadata: {
      tmdbId,
      mediaType,
      status,
      userItemId: upsertResult.userItem.id,
    },
  })

  await invalidateUserStatsCache(redis, request.user.id)

  const result = await getUserItemService({
    mediaType,
    tmdbId,
    userId: request.user.id,
  })

  const userItem = result.userItem
  if (!userItem) {
    logger.error(
      {
        method: request.method,
        url: request.url,
        route: request.routeOptions?.url,
        userId: request.user.id,
        tmdbId,
        mediaType,
        status,
        statusCode: 500,
      },
      'User item could not be retrieved after upsert'
    )
    return reply.status(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'User item could not be retrieved after upsert.',
    })
  }

  return reply.status(201).send({
    userItem: {
      id: userItem.id,
      userId: userItem.userId,
      tmdbId: userItem.tmdbId,
      mediaType: userItem.mediaType,
      status: userItem.status,
      addedAt:
        userItem.addedAt instanceof Date
          ? userItem.addedAt.toISOString()
          : userItem.addedAt,
      updatedAt:
        userItem.updatedAt instanceof Date
          ? userItem.updatedAt.toISOString()
          : userItem.updatedAt,
      position: userItem.position ?? 0,
      watchEntries,
    },
  })
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
  reply: FastifyReply,
  redis: FastifyRedis
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

  // Invalidate user stats cache since item was deleted
  await invalidateUserStatsCache(redis, deletedUserItem.userId)

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

export async function reorderUserItemsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { status, orderedIds } = reorderUserItemsBodySchema.parse(request.body)

  await reorderUserItemsService({
    userId: request.user.id,
    status,
    orderedIds,
  })

  return reply.status(204).send()
}

export async function getUserItemsCountController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { userId } = getUserItemsCountQuerySchema.parse(request.query)
  const result = await getUserItemsCountService({ userId })

  return reply.status(200).send(result)
}
