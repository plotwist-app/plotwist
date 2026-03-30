import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import {
  adminCreateAchievementController,
  adminDeleteAchievementController,
  adminGetAchievementController,
  adminListAchievementsController,
  adminUpdateAchievementController,
  claimAchievementController,
  getUserAchievementsController,
  toggleEquipController,
} from '../controllers/achievements-controller'
import { verifyJwt } from '../middlewares/verify-jwt'
import {
  achievementParamsSchema,
  adminCreateAchievementResponseSchema,
  adminDeleteAchievementResponseSchema,
  adminGetAchievementResponseSchema,
  adminListAchievementsResponseSchema,
  adminUpdateAchievementResponseSchema,
  claimAchievementResponseSchema,
  createAchievementBodySchema,
  getUserAchievementsResponseSchema,
  toggleEquipBodySchema,
  toggleEquipResponseSchema,
  updateAchievementBodySchema,
} from '../schemas/achievements'

export async function achievementsRoutes(app: FastifyInstance) {
  const userTag = 'Achievements'
  const adminTag = 'Admin Achievements'

  // User routes
  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/achievements',
      onRequest: [verifyJwt],
      schema: {
        description: 'Get all achievements with user progress',
        tags: [userTag],
        response: getUserAchievementsResponseSchema,
        security: [{ bearerAuth: [] }],
      },
      handler: getUserAchievementsController,
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/achievements/:id/claim',
      onRequest: [verifyJwt],
      schema: {
        description: 'Claim a completed achievement',
        tags: [userTag],
        params: achievementParamsSchema,
        response: claimAchievementResponseSchema,
        security: [{ bearerAuth: [] }],
      },
      handler: claimAchievementController,
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'PUT',
      url: '/achievements/:id/equip',
      onRequest: [verifyJwt],
      schema: {
        description: 'Toggle equipped status of a claimed achievement',
        tags: [userTag],
        params: achievementParamsSchema,
        body: toggleEquipBodySchema,
        response: toggleEquipResponseSchema,
        security: [{ bearerAuth: [] }],
      },
      handler: toggleEquipController,
    })
  )

  // Admin routes
  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/admin/achievements',
      onRequest: [verifyJwt],
      schema: {
        description: 'List all achievements (admin)',
        tags: [adminTag],
        response: adminListAchievementsResponseSchema,
        security: [{ bearerAuth: [] }],
      },
      handler: adminListAchievementsController,
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/admin/achievements/:id',
      onRequest: [verifyJwt],
      schema: {
        description: 'Get a single achievement (admin)',
        tags: [adminTag],
        params: achievementParamsSchema,
        response: adminGetAchievementResponseSchema,
        security: [{ bearerAuth: [] }],
      },
      handler: adminGetAchievementController,
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/admin/achievements',
      onRequest: [verifyJwt],
      schema: {
        description: 'Create a new achievement (admin)',
        tags: [adminTag],
        body: createAchievementBodySchema,
        response: adminCreateAchievementResponseSchema,
        security: [{ bearerAuth: [] }],
      },
      handler: adminCreateAchievementController,
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'PUT',
      url: '/admin/achievements/:id',
      onRequest: [verifyJwt],
      schema: {
        description: 'Update an achievement (admin)',
        tags: [adminTag],
        params: achievementParamsSchema,
        body: updateAchievementBodySchema,
        response: adminUpdateAchievementResponseSchema,
        security: [{ bearerAuth: [] }],
      },
      handler: adminUpdateAchievementController,
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'DELETE',
      url: '/admin/achievements/:id',
      onRequest: [verifyJwt],
      schema: {
        description: 'Delete an achievement (admin)',
        tags: [adminTag],
        params: achievementParamsSchema,
        response: adminDeleteAchievementResponseSchema,
        security: [{ bearerAuth: [] }],
      },
      handler: adminDeleteAchievementController,
    })
  )
}
