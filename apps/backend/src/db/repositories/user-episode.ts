import { and, count, desc, eq, inArray } from 'drizzle-orm'
import type { InsertUserEpisode } from '@/domain/entities/user-episode'
import type { GetUserEpisodesInput } from '@/domain/services/user-episodes/get-user-episodes'
import { withDbTracing } from '@/infra/telemetry/with-db-tracing'
import { db } from '..'
import { schema } from '../schema'

const insertUserEpisodesImpl = async (values: InsertUserEpisode[]) => {
  return db
    .insert(schema.userEpisodes)
    .values(values)
    .returning()
    .onConflictDoNothing()
}

export const insertUserEpisodes = withDbTracing(
  'insert-user-episodes',
  insertUserEpisodesImpl
)

const selectUserEpisodesImpl = async ({
  userId,
  tmdbId,
}: GetUserEpisodesInput) => {
  return db
    .select()
    .from(schema.userEpisodes)
    .where(
      and(
        eq(schema.userEpisodes.userId, userId),
        tmdbId ? eq(schema.userEpisodes.tmdbId, tmdbId) : undefined
      )
    )
    .orderBy(schema.userEpisodes.episodeNumber)
}

export const selectUserEpisodes = withDbTracing(
  'select-user-episodes',
  selectUserEpisodesImpl
)

const deleteUserEpisodesImpl = async (ids: string[]) => {
  return db
    .delete(schema.userEpisodes)
    .where(inArray(schema.userEpisodes.id, ids))
}

export const deleteUserEpisodes = withDbTracing(
  'delete-user-episodes',
  deleteUserEpisodesImpl
)

const selectMostWatchedImpl = async (userId: string) => {
  return db
    .select({ count: count(), tmdbId: schema.userEpisodes.tmdbId })
    .from(schema.userEpisodes)
    .where(and(eq(schema.userEpisodes.userId, userId)))
    .groupBy(schema.userEpisodes.tmdbId)
    .orderBy(desc(count()))
    .limit(3)
}

export const selectMostWatched = withDbTracing(
  'select-most-watched',
  selectMostWatchedImpl
)
