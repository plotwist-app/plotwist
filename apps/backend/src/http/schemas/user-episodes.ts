import { schema } from '@/db/schema'
import { UserEpisodeAlreadyRegisteredError } from '@/domain/errors/user-episode-already-registered-error'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const createUserEpisodesBodySchema = z.array(
  createInsertSchema(schema.userEpisodes).omit({
    userId: true,
    watchedAt: true,
    id: true,
  })
)

export const createUserEpisodesResponseSchema = {
  201: z
    .array(createSelectSchema(schema.userEpisodes))
    .describe('User episodes registered.'),
  409: z
    .object({
      message: z
        .string()
        .default(new UserEpisodeAlreadyRegisteredError().message),
    })
    .describe('User episodes already registered.'),
}

export const getUserEpisodesQuerySchema = z.object({
  tmdbId: z.string(),
})

export const getUserEpisodesResponseSchema = {
  200: z.array(createSelectSchema(schema.userEpisodes)),
}

export const deleteUserEpisodesBodySchema = z.object({
  ids: z.array(z.string()),
})

export const deleteUserEpisodesResponseSchema = {
  204: z.null(),
}
