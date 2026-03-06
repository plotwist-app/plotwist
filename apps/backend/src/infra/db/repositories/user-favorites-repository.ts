import { and, eq, asc } from 'drizzle-orm'
import { db } from '..'
import { schema } from '../schema'

export async function insertFavorite(values: {
  userId: string
  tmdbId: number
  mediaType: 'MOVIE' | 'TV_SHOW'
  position: number
}) {
  return db
    .insert(schema.userFavorites)
    .values(values)
    .onConflictDoUpdate({
      target: [
        schema.userFavorites.userId,
        schema.userFavorites.tmdbId,
        schema.userFavorites.mediaType,
      ],
      set: { position: values.position },
    })
    .returning()
}

export async function deleteFavorite(userId: string, tmdbId: number, mediaType: string) {
  return db
    .delete(schema.userFavorites)
    .where(
      and(
        eq(schema.userFavorites.userId, userId),
        eq(schema.userFavorites.tmdbId, tmdbId),
        eq(schema.userFavorites.mediaType, mediaType as 'MOVIE' | 'TV_SHOW')
      )
    )
    .returning()
}

export async function selectFavoritesByUser(userId: string) {
  return db
    .select()
    .from(schema.userFavorites)
    .where(eq(schema.userFavorites.userId, userId))
    .orderBy(asc(schema.userFavorites.position))
}

export async function selectFavorite(userId: string, tmdbId: number, mediaType: string) {
  const [favorite] = await db
    .select()
    .from(schema.userFavorites)
    .where(
      and(
        eq(schema.userFavorites.userId, userId),
        eq(schema.userFavorites.tmdbId, tmdbId),
        eq(schema.userFavorites.mediaType, mediaType as 'MOVIE' | 'TV_SHOW')
      )
    )
  return favorite ?? null
}
