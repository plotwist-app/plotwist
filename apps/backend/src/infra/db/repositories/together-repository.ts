import { and, desc, eq, inArray, sql } from 'drizzle-orm'
import { db } from '..'
import {
  togetherParticipants,
  togetherRooms,
  togetherSwipes,
} from '../schema/together'

export async function insertTogetherRoom(values: {
  code: string
  hostUserId?: string | null
  watchProviderIds?: number[]
  watchRegion?: string
  maxRuntime?: number | null
  mood?: 'FUN' | 'SUSPENSE' | 'COMFORT' | 'ANY'
}) {
  const [room] = await db.insert(togetherRooms).values(values).returning()
  return room
}

export async function selectTogetherRoomByCode(code: string) {
  const [room] = await db
    .select()
    .from(togetherRooms)
    .where(eq(togetherRooms.code, code.toUpperCase()))
    .limit(1)
  return room ?? null
}

export async function insertTogetherParticipant(values: {
  roomId: string
  displayName: string
  tokenHash: string
  userId?: string | null
}) {
  const [participant] = await db
    .insert(togetherParticipants)
    .values(values)
    .returning()
  return participant
}

export async function insertTogetherParticipantWithinCapacity(
  values: {
    roomId: string
    displayName: string
    tokenHash: string
    userId?: string | null
  },
  capacity: number
) {
  return db.transaction(async tx => {
    await tx.execute(
      sql`select id from ${togetherRooms} where ${togetherRooms.id} = ${values.roomId} for update`
    )

    const [row] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(togetherParticipants)
      .where(eq(togetherParticipants.roomId, values.roomId))

    if ((row?.count ?? 0) >= capacity) {
      return null
    }

    const [participant] = await tx
      .insert(togetherParticipants)
      .values(values)
      .returning()
    return participant
  })
}

export async function selectTogetherParticipantByTokenHash(tokenHash: string) {
  const [participant] = await db
    .select()
    .from(togetherParticipants)
    .where(eq(togetherParticipants.tokenHash, tokenHash))
    .limit(1)
  return participant ?? null
}

export async function selectTogetherParticipantsByRoomId(roomId: string) {
  return db
    .select({
      id: togetherParticipants.id,
      displayName: togetherParticipants.displayName,
      userId: togetherParticipants.userId,
      createdAt: togetherParticipants.createdAt,
    })
    .from(togetherParticipants)
    .where(eq(togetherParticipants.roomId, roomId))
    .orderBy(togetherParticipants.createdAt)
}

export async function upsertTogetherSwipe(values: {
  roomId: string
  participantId: string
  tmdbId: number
  mediaType: 'MOVIE' | 'TV_SHOW'
  decision: 'LIKE' | 'PASS' | 'MAYBE'
  title: string
  posterPath?: string | null
  voteAverage?: number | null
  releaseDate?: string | null
  overview?: string | null
}) {
  const [swipe] = await db
    .insert(togetherSwipes)
    .values(values)
    .onConflictDoUpdate({
      target: [
        togetherSwipes.participantId,
        togetherSwipes.tmdbId,
        togetherSwipes.mediaType,
      ],
      set: {
        decision: values.decision,
        title: values.title,
        posterPath: values.posterPath,
        voteAverage: values.voteAverage,
        releaseDate: values.releaseDate,
        overview: values.overview,
      },
    })
    .returning()
  return swipe
}

export async function selectTogetherSwipeIdsByParticipant(
  participantId: string
) {
  return db
    .select({
      tmdbId: togetherSwipes.tmdbId,
      mediaType: togetherSwipes.mediaType,
    })
    .from(togetherSwipes)
    .where(eq(togetherSwipes.participantId, participantId))
}

export async function countTitleInterest(input: {
  roomId: string
  tmdbId: number
  mediaType: string
}) {
  const [row] = await db
    .select({
      count: sql<number>`count(distinct ${togetherSwipes.participantId})::int`,
    })
    .from(togetherSwipes)
    .where(
      and(
        eq(togetherSwipes.roomId, input.roomId),
        eq(togetherSwipes.tmdbId, input.tmdbId),
        eq(togetherSwipes.mediaType, input.mediaType),
        inArray(togetherSwipes.decision, ['LIKE', 'MAYBE'])
      )
    )
  return row?.count ?? 0
}

export async function selectTogetherMatches(roomId: string) {
  return db
    .select({
      tmdbId: togetherSwipes.tmdbId,
      mediaType: togetherSwipes.mediaType,
      title: togetherSwipes.title,
      posterPath: togetherSwipes.posterPath,
      voteAverage: togetherSwipes.voteAverage,
      releaseDate: togetherSwipes.releaseDate,
      overview: togetherSwipes.overview,
      likeCount: sql<number>`count(*) filter (where ${togetherSwipes.decision} = 'LIKE')::int`,
      maybeCount: sql<number>`count(*) filter (where ${togetherSwipes.decision} = 'MAYBE')::int`,
      interestCount: sql<number>`count(distinct ${togetherSwipes.participantId})::int`,
    })
    .from(togetherSwipes)
    .where(
      and(
        eq(togetherSwipes.roomId, roomId),
        inArray(togetherSwipes.decision, ['LIKE', 'MAYBE'])
      )
    )
    .groupBy(
      togetherSwipes.tmdbId,
      togetherSwipes.mediaType,
      togetherSwipes.title,
      togetherSwipes.posterPath,
      togetherSwipes.voteAverage,
      togetherSwipes.releaseDate,
      togetherSwipes.overview
    )
    .having(sql`count(distinct ${togetherSwipes.participantId}) >= 2`)
    .orderBy(
      desc(sql`count(*) filter (where ${togetherSwipes.decision} = 'LIKE')`),
      desc(sql`count(*) filter (where ${togetherSwipes.decision} = 'MAYBE')`)
    )
}
