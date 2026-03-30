import { and, desc, eq } from 'drizzle-orm'
import { db } from '..'
import { schema } from '../schema'

export async function insertRecommendation(values: {
  fromUserId: string
  toUserId: string
  tmdbId: number
  mediaType: 'TV_SHOW' | 'MOVIE'
  message: string | null
}) {
  const [rec] = await db
    .insert(schema.recommendations)
    .values(values)
    .returning()
  return rec
}

export async function selectReceivedRecommendations(userId: string) {
  return db
    .select({
      id: schema.recommendations.id,
      fromUserId: schema.recommendations.fromUserId,
      toUserId: schema.recommendations.toUserId,
      tmdbId: schema.recommendations.tmdbId,
      mediaType: schema.recommendations.mediaType,
      message: schema.recommendations.message,
      status: schema.recommendations.status,
      createdAt: schema.recommendations.createdAt,
      fromUsername: schema.users.username,
      fromDisplayName: schema.users.displayName,
      fromAvatarUrl: schema.users.avatarUrl,
    })
    .from(schema.recommendations)
    .where(
      and(
        eq(schema.recommendations.toUserId, userId),
        eq(schema.recommendations.status, 'PENDING')
      )
    )
    .leftJoin(
      schema.users,
      eq(schema.recommendations.fromUserId, schema.users.id)
    )
    .orderBy(desc(schema.recommendations.createdAt))
}

export async function updateRecommendationStatus(
  id: string,
  userId: string,
  status: 'ACCEPTED' | 'DECLINED'
) {
  const [rec] = await db
    .update(schema.recommendations)
    .set({ status })
    .where(
      and(
        eq(schema.recommendations.id, id),
        eq(schema.recommendations.toUserId, userId)
      )
    )
    .returning()
  return rec
}
