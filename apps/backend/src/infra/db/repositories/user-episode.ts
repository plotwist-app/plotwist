import { and, count, desc, eq, gte, inArray, lte } from 'drizzle-orm'
import type { InsertUserEpisode } from '@/domain/entities/user-episode'
import type { GetUserEpisodesInput } from '@/domain/services/user-episodes/get-user-episodes'
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
  startDate,
  endDate,
}: GetUserEpisodesInput & { startDate?: Date; endDate?: Date }) {
  const whereConditions = [
    eq(schema.userEpisodes.userId, userId),
    tmdbId ? eq(schema.userEpisodes.tmdbId, tmdbId) : undefined,
  ].filter(Boolean)

  if (startDate) {
    whereConditions.push(gte(schema.userEpisodes.watchedAt, startDate))
  }
  if (endDate) {
    whereConditions.push(lte(schema.userEpisodes.watchedAt, endDate))
  }

  return db
    .select()
    .from(schema.userEpisodes)
    .where(and(...whereConditions))
    .orderBy(schema.userEpisodes.episodeNumber)
}

export async function deleteUserEpisodes(ids: string[]) {
  return db
    .delete(schema.userEpisodes)
    .where(inArray(schema.userEpisodes.id, ids))
}

export async function selectMostWatched(
  userId: string,
  startDate?: Date,
  endDate?: Date
) {
  const whereConditions = [eq(schema.userEpisodes.userId, userId)]

  if (startDate) {
    whereConditions.push(gte(schema.userEpisodes.watchedAt, startDate))
  }
  if (endDate) {
    whereConditions.push(lte(schema.userEpisodes.watchedAt, endDate))
  }

  return db
    .select({ count: count(), tmdbId: schema.userEpisodes.tmdbId })
    .from(schema.userEpisodes)
    .where(and(...whereConditions))
    .groupBy(schema.userEpisodes.tmdbId)
    .orderBy(desc(count()))
    .limit(3)
}
