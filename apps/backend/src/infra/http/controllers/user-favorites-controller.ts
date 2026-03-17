import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  toggleFavoriteBodySchema,
  getUserFavoritesQuerySchema,
  checkFavoriteQuerySchema,
} from '../schemas/user-favorites'
import {
  insertFavorite,
  deleteFavorite,
  selectFavoritesByUser,
  selectFavorite,
} from '@/infra/db/repositories/user-favorites-repository'

export async function toggleFavoriteController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { tmdbId, mediaType, position } = toggleFavoriteBodySchema.parse(
    request.body
  )
  const userId = request.user.id

  const existing = await selectFavorite(userId, tmdbId, mediaType)

  if (existing) {
    await deleteFavorite(userId, tmdbId, mediaType)
    return reply.status(200).send({ favorite: null, action: 'removed' })
  }

  const [favorite] = await insertFavorite({
    userId,
    tmdbId,
    mediaType,
    position,
  })

  return reply.status(200).send({
    favorite: {
      ...favorite,
      createdAt: favorite.createdAt.toISOString(),
    },
    action: 'added',
  })
}

export async function getUserFavoritesController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { userId } = getUserFavoritesQuerySchema.parse(request.query)

  const favorites = await selectFavoritesByUser(userId)

  return reply.status(200).send({
    favorites: favorites.map(f => ({
      ...f,
      createdAt: f.createdAt.toISOString(),
    })),
  })
}

export async function checkFavoriteController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { tmdbId, mediaType } = checkFavoriteQuerySchema.parse(request.query)
  const userId = request.user.id

  const favorite = await selectFavorite(userId, Number(tmdbId), mediaType)

  return reply.status(200).send({ isFavorite: !!favorite })
}
