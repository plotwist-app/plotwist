import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import {
  checkFavoriteController,
  getUserFavoritesController,
  toggleFavoriteController,
} from '../controllers/user-favorites-controller'
import { verifyJwt } from '../middlewares/verify-jwt'
import {
  checkFavoriteQuerySchema,
  checkFavoriteResponseSchema,
  getUserFavoritesQuerySchema,
  getUserFavoritesResponseSchema,
  toggleFavoriteBodySchema,
  toggleFavoriteResponseSchema,
} from '../schemas/user-favorites'

const TAGS = ['User Favorites']

export async function userFavoritesRoutes(app: FastifyInstance) {
  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'PUT',
      url: '/user/favorite',
      onRequest: [verifyJwt],
      schema: {
        description: 'Toggle favorite (add or remove)',
        tags: TAGS,
        body: toggleFavoriteBodySchema,
        response: toggleFavoriteResponseSchema,
        security: [{ bearerAuth: [] }],
      },
      handler: toggleFavoriteController,
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/user/favorites',
      schema: {
        description: 'Get user favorites',
        tags: TAGS,
        querystring: getUserFavoritesQuerySchema,
        response: getUserFavoritesResponseSchema,
      },
      handler: getUserFavoritesController,
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/user/favorite/check',
      onRequest: [verifyJwt],
      schema: {
        description: 'Check if item is favorited',
        tags: TAGS,
        querystring: checkFavoriteQuerySchema,
        response: checkFavoriteResponseSchema,
        security: [{ bearerAuth: [] }],
      },
      handler: checkFavoriteController,
    })
  )
}
