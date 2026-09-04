import { z } from 'zod'

export const togetherMoodSchema = z.enum(['FUN', 'SUSPENSE', 'COMFORT', 'ANY'])
export const togetherMediaTypeSchema = z.enum(['MOVIE', 'TV_SHOW'])
export const togetherDecisionSchema = z.enum(['LIKE', 'PASS', 'MAYBE'])

export const createTogetherRoomBodySchema = z.object({
  displayName: z.string().min(1).max(40),
  watchProviderIds: z.array(z.number().int()).optional().default([]),
  watchRegion: z.string().min(2).max(5).optional().default('BR'),
  maxRuntime: z.number().int().positive().nullable().optional(),
  mood: togetherMoodSchema.optional().default('ANY'),
})

export const togetherCodeParamsSchema = z.object({
  code: z.string().min(4).max(8),
})

export const joinTogetherRoomBodySchema = z.object({
  displayName: z.string().max(40).optional().default(''),
})

export const createTogetherSwipeBodySchema = z.object({
  tmdbId: z.number().int(),
  mediaType: togetherMediaTypeSchema,
  decision: togetherDecisionSchema,
  title: z.string().min(1),
  posterPath: z.string().nullable().optional(),
  voteAverage: z.number().nullable().optional(),
  releaseDate: z.string().nullable().optional(),
  overview: z.string().nullable().optional(),
})

const togetherRoomSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  watchProviderIds: z.array(z.number()).nullable(),
  watchRegion: z.string(),
  maxRuntime: z.number().nullable(),
  mood: togetherMoodSchema,
  createdAt: z.string(),
})

const togetherParticipantSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string(),
  userId: z.string().uuid().nullable().optional(),
  createdAt: z.string().optional(),
})

export const togetherSessionResponseSchema = {
  200: z.object({
    room: togetherRoomSchema,
    participant: togetherParticipantSchema,
    participantToken: z.string(),
  }),
  201: z.object({
    room: togetherRoomSchema,
    participant: togetherParticipantSchema,
    participantToken: z.string(),
  }),
  400: z.object({ message: z.string() }),
  404: z.object({ message: z.string() }),
}

export const getTogetherRoomResponseSchema = {
  200: z.object({
    room: togetherRoomSchema,
    participants: z.array(togetherParticipantSchema),
    me: z
      .object({
        id: z.string().uuid(),
        displayName: z.string(),
      })
      .nullable(),
    swipedIds: z.array(
      z.object({
        tmdbId: z.number(),
        mediaType: z.string(),
      })
    ),
  }),
  401: z.object({ message: z.string() }),
  404: z.object({ message: z.string() }),
}

export const createTogetherSwipeResponseSchema = {
  200: z.object({
    swipe: z.object({
      id: z.string().uuid(),
      tmdbId: z.number(),
      mediaType: z.string(),
      decision: togetherDecisionSchema,
      title: z.string(),
    }),
    match: z
      .object({
        tmdbId: z.number(),
        mediaType: z.string(),
        title: z.string(),
        posterPath: z.string().nullable(),
        voteAverage: z.number().nullable(),
        releaseDate: z.string().nullable(),
        likeCount: z.number(),
        maybeCount: z.number().optional(),
        matchPercent: z.number(),
      })
      .nullable(),
  }),
  401: z.object({ message: z.string() }),
  404: z.object({ message: z.string() }),
}

export const getTogetherMatchesResponseSchema = {
  200: z.object({
    matches: z.array(
      z.object({
        tmdbId: z.number(),
        mediaType: z.string(),
        title: z.string(),
        posterPath: z.string().nullable(),
        voteAverage: z.number().nullable(),
        releaseDate: z.string().nullable(),
        likeCount: z.number(),
        maybeCount: z.number().optional(),
        matchPercent: z.number(),
        highlighted: z.boolean().optional(),
      })
    ),
  }),
  401: z.object({ message: z.string() }),
  404: z.object({ message: z.string() }),
}
