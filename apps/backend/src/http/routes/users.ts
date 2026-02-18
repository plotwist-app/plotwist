import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { withTracing } from '@/infra/telemetry/with-tracing'

import {
  createUserController,
  getMeController,
  getUserByIdController,
  getUserByUsernameController,
  getUserPreferencesController,
  isEmailAvailableController,
  isUsernameAvailableController,
  searchUsersByUsernameController,
  updateUserController,
  updateUserPasswordController,
  updateUserPreferencesController,
} from '../controllers/user-controller'
import { verifyJwt } from '../middlewares/verify-jwt'
import {
  checkAvailableUsernameQuerySchema,
  checkAvailableUsernameResponseSchema,
  createUserBodySchema,
  createUserResponseSchema,
  getMeResponseSchema,
  getUserByIdParamsSchema,
  getUserByIdResponseSchema,
  getUserByUsernameParamsSchema,
  getUserByUsernameResponseSchema,
  getUserPreferencesResponseSchema,
  isEmailAvailableQuerySchema,
  isEmailAvailableResponseSchema,
  searchUsersByUsernameQuerySchema,
  searchUsersByUsernameResponseSchema,
  updateUserBodySchema,
  updateUserPasswordBodySchema,
  updateUserPasswordResponseSchema,
  updateUserPreferencesBodySchema,
  updateUserPreferencesResponseSchema,
  updateUserResponseSchema,
} from '../schemas/users'

export async function usersRoute(app: FastifyInstance) {
  const usersTag = 'Users'

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/users/create',
      schema: {
        description: 'Create a user',
        tags: [usersTag],
        body: createUserBodySchema,
        response: createUserResponseSchema,
      },
      handler: withTracing('create-user', createUserController),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/users/available-username',
      schema: {
        description: 'Check if this username is available',
        tags: [usersTag],
        querystring: checkAvailableUsernameQuerySchema,
        response: checkAvailableUsernameResponseSchema,
      },
      handler: withTracing('is-username-available', isUsernameAvailableController),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/users/available-email',
      schema: {
        description: 'Check if this email is available',
        tags: [usersTag],
        querystring: isEmailAvailableQuerySchema,
        response: isEmailAvailableResponseSchema,
      },
      handler: withTracing('is-email-available', isEmailAvailableController),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/users/:username',
      schema: {
        description: 'Get user by username',
        tags: [usersTag],
        params: getUserByUsernameParamsSchema,
        response: getUserByUsernameResponseSchema,
      },
      handler: withTracing('get-user-by-username', getUserByUsernameController),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/user/by/:id',
      schema: {
        description: 'Get user by',
        tags: [usersTag],
        params: getUserByIdParamsSchema,
        response: getUserByIdResponseSchema,
      },
      handler: withTracing('get-user-by-id', getUserByIdController),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/me',
      onRequest: [verifyJwt],
      schema: {
        description: 'Get information about the current user',
        tags: [usersTag],
        response: getMeResponseSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      handler: withTracing('get-me', getMeController),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'PATCH',
      url: '/user',
      onRequest: [verifyJwt],
      schema: {
        description: 'Update user',
        tags: [usersTag],
        body: updateUserBodySchema,
        response: updateUserResponseSchema,
        security: [{ bearerAuth: [] }],
      },
      handler: withTracing('update-user', updateUserController),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'PATCH',
      url: '/user/password',
      schema: {
        description: 'Update user password',
        tags: [usersTag],
        body: updateUserPasswordBodySchema,
        response: updateUserPasswordResponseSchema,
      },
      handler: withTracing('update-user-password', updateUserPasswordController),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'PATCH',
      url: '/user/preferences',
      onRequest: [verifyJwt],
      schema: {
        description: 'Update user preferences',
        operationId: 'updateUserPreferences',
        tags: [usersTag],
        body: updateUserPreferencesBodySchema,
        response: updateUserPreferencesResponseSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      handler: withTracing('update-user-preferences', updateUserPreferencesController),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/user/preferences',
      onRequest: [verifyJwt],
      schema: {
        description: 'Get user preferences',
        operationId: 'getUserPreferences',
        tags: [usersTag],
        response: getUserPreferencesResponseSchema,
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      handler: withTracing('get-user-preferences', getUserPreferencesController),
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'GET',
      url: '/users/search',
      schema: {
        description: 'Get users by username',
        tags: [usersTag],
        querystring: searchUsersByUsernameQuerySchema,
        response: searchUsersByUsernameResponseSchema,
      },
      handler: withTracing('search-users-by-username', searchUsersByUsernameController),
    })
  )
}
