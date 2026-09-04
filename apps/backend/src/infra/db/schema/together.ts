import { randomUUID } from 'node:crypto'
import { relations } from 'drizzle-orm'
import {
  index,
  integer,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { users } from '.'

export const togetherMoodEnum = pgEnum('together_mood', [
  'FUN',
  'SUSPENSE',
  'COMFORT',
  'ANY',
])

export const togetherSwipeDecisionEnum = pgEnum('together_swipe_decision', [
  'LIKE',
  'PASS',
  'MAYBE',
])

export const togetherRooms = pgTable(
  'together_rooms',
  {
    id: uuid('id')
      .$defaultFn(() => randomUUID())
      .primaryKey(),
    code: varchar('code', { length: 8 }).notNull().unique(),
    hostUserId: uuid('host_user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    watchProviderIds: integer('watch_provider_ids').array().default([]),
    watchRegion: varchar('watch_region').notNull().default('BR'),
    maxRuntime: integer('max_runtime'),
    mood: togetherMoodEnum('mood').notNull().default('ANY'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    codeIdx: index('idx_together_rooms_code').on(table.code),
  })
)

export const togetherParticipants = pgTable(
  'together_participants',
  {
    id: uuid('id')
      .$defaultFn(() => randomUUID())
      .primaryKey(),
    roomId: uuid('room_id')
      .references(() => togetherRooms.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    displayName: varchar('display_name').notNull(),
    tokenHash: varchar('token_hash').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    roomIdx: index('idx_together_participants_room').on(table.roomId),
    tokenHashUnique: unique('together_participants_token_hash_unique').on(
      table.tokenHash
    ),
  })
)

export const togetherSwipes = pgTable(
  'together_swipes',
  {
    id: uuid('id')
      .$defaultFn(() => randomUUID())
      .primaryKey(),
    roomId: uuid('room_id')
      .references(() => togetherRooms.id, { onDelete: 'cascade' })
      .notNull(),
    participantId: uuid('participant_id')
      .references(() => togetherParticipants.id, { onDelete: 'cascade' })
      .notNull(),
    tmdbId: integer('tmdb_id').notNull(),
    mediaType: varchar('media_type').notNull(),
    decision: togetherSwipeDecisionEnum('decision').notNull(),
    title: varchar('title').notNull(),
    posterPath: varchar('poster_path'),
    voteAverage: real('vote_average'),
    releaseDate: varchar('release_date'),
    overview: text('overview'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => ({
    participantTitleUnique: unique(
      'together_swipes_participant_title_unique'
    ).on(table.participantId, table.tmdbId, table.mediaType),
    roomIdx: index('idx_together_swipes_room').on(table.roomId),
  })
)

export const togetherRoomsRelations = relations(togetherRooms, ({ many }) => ({
  participants: many(togetherParticipants),
  swipes: many(togetherSwipes),
}))

export const togetherParticipantsRelations = relations(
  togetherParticipants,
  ({ one, many }) => ({
    room: one(togetherRooms, {
      fields: [togetherParticipants.roomId],
      references: [togetherRooms.id],
    }),
    user: one(users, {
      fields: [togetherParticipants.userId],
      references: [users.id],
    }),
    swipes: many(togetherSwipes),
  })
)

export const togetherSwipesRelations = relations(togetherSwipes, ({ one }) => ({
  room: one(togetherRooms, {
    fields: [togetherSwipes.roomId],
    references: [togetherRooms.id],
  }),
  participant: one(togetherParticipants, {
    fields: [togetherSwipes.participantId],
    references: [togetherParticipants.id],
  }),
}))
