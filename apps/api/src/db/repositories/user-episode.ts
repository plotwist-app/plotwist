import type { InsertUserEpisode } from '@/domain/entities/user-episode'
import type { GetUserEpisodesInput } from '@/domain/services/user-episodes/get-user-episodes'
import { and, count, desc, eq, inArray } from 'drizzle-orm'
import { db } from '..'
import { schema } from '../schema'

export async function insertUserEpisodes(values: InsertUserEpisode[]) {
  return db
    .insert(schema.userEpisodes)
    .values(values)
    .returning()
    .onConflictDoNothing()
}

export async function selectUserEpisodes({
  userId,
  tmdbId,
}: GetUserEpisodesInput) {
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

export async function deleteUserEpisodes(ids: string[]) {
  return db
    .delete(schema.userEpisodes)
    .where(inArray(schema.userEpisodes.id, ids))
}

export async function selectMostWatched(userId: string) {
  return db
    .select({ count: count(), tmdbId: schema.userEpisodes.tmdbId })
    .from(schema.userEpisodes)
    .where(and(eq(schema.userEpisodes.userId, userId)))
    .groupBy(schema.userEpisodes.tmdbId)
    .orderBy(desc(count()))
    .limit(3)
}
