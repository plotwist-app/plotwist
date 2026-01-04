import { randomUUID } from 'node:crypto'

import { eq, relations, sql } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'
import { userPreferences } from './user-preferences'

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'ACTIVE',
  'CANCELED',
  'EXPIRED',
  'PENDING_CANCELLATION',
])

export const subscriptionTypeEnum = pgEnum('subscription_type', [
  'MEMBER',
  'PRO',
])

export const listVisibilityEnum = pgEnum('list_visibility', [
  'PUBLIC',
  'NETWORK',
  'PRIVATE',
])

export const languagesEnum = pgEnum('languages', [
  'en-US',
  'es-ES',
  'fr-FR',
  'it-IT',
  'de-DE',
  'pt-BR',
  'ja-JP',
])

export const mediaTypeEnum = pgEnum('media_type', ['TV_SHOW', 'MOVIE'])

export const statusEnum = pgEnum('status', [
  'WATCHLIST',
  'WATCHED',
  'WATCHING',
  'DROPPED',
])

export const importItemStatusEnum = pgEnum('import_item_status', [
  'COMPLETED',
  'FAILED',
  'NOT_STARTED',
])

export const importStatusEnum = pgEnum('import_status_enum', [
  'PARTIAL',
  'COMPLETED',
  'FAILED',
  'NOT_STARTED',
])

export const providersEnum = pgEnum('providers_enum', [
  'MY_ANIME_LIST',
  'LETTERBOXD',
])

export const followers = pgTable(
  'followers',
  {
    followerId: uuid('follower_id')
      .references(() => users.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    followedId: uuid('followed_id')
      .references(() => users.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => {
    return {
      pk: primaryKey({
        columns: [table.followedId, table.followerId],
      }),
    }
  }
)

export const followersRelations = relations(followers, ({ one }) => ({
  follower: one(users, {
    fields: [followers.followerId],
    references: [users.id],
    relationName: 'followerRelation',
  }),
  followed: one(users, {
    fields: [followers.followedId],
    references: [users.id],
    relationName: 'followedRelation',
  }),
}))

export const listItems = pgTable(
  'list_items',
  {
    id: uuid('id')
      .$defaultFn(() => randomUUID())
      .notNull(),
    listId: uuid('list_id')
      .references(() => lists.id, { onDelete: 'cascade' })
      .notNull(),
    tmdbId: integer('tmdb_id').notNull(),
    mediaType: mediaTypeEnum('media_type').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    position: integer('position'),
  },
  table => {
    return {
      pk: primaryKey({
        columns: [table.id, table.listId],
      }),
    }
  }
)

export const listItemsRelations = relations(listItems, ({ one, many }) => ({
  lists: one(lists, {
    fields: [listItems.listId],
    references: [lists.id],
  }),
}))

export const lists = pgTable(
  'lists',
  {
    id: uuid('id')
      .$defaultFn(() => randomUUID())
      .primaryKey()
      .notNull(),
    title: varchar('title').notNull(),
    userId: uuid('user_id')
      .references(() => users.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    description: varchar('description'),
    bannerUrl: varchar('banner_url'),
    visibility: listVisibilityEnum('visibility').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => {
    return {
      userId: index('user_id_idx').on(table.userId),
    }
  }
)

export const listRelations = relations(lists, ({ one, many }) => ({
  listItems: many(listItems),
  users: one(users, {
    fields: [lists.userId],
    references: [users.id],
  }),
}))

export const reviewReplies = pgTable('review_replies', {
  id: uuid('id')
    .$defaultFn(() => randomUUID())
    .primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  reply: varchar('reply').notNull(),
  reviewId: uuid('review_id')
    .references(() => reviews.id, { onDelete: 'cascade' })
    .notNull(),
})

export const reviewsRepliesRelations = relations(
  reviewReplies,
  ({ one, many }) => ({
    users: one(users, {
      fields: [reviewReplies.userId],
      references: [users.id],
    }),
    reviews: one(reviews, {
      fields: [reviewReplies.reviewId],
      references: [reviews.id],
    }),
  })
)

export const reviews = pgTable('reviews', {
  id: uuid('id')
    .$defaultFn(() => randomUUID())
    .primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  tmdbId: integer('tmdb_id').notNull(),
  mediaType: mediaTypeEnum('media_type').notNull(),
  review: varchar('review').notNull(),
  rating: real('rating').notNull(),
  hasSpoilers: boolean('has_spoilers').notNull().default(false),
  language: languagesEnum('language'),
  seasonNumber: integer('season_number'),
  episodeNumber: integer('episode_number'),
})

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  users: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}))

export const users = pgTable(
  'users',
  {
    id: uuid('id')
      .$defaultFn(() => randomUUID())
      .primaryKey(),
    username: varchar('username').notNull().unique(),
    email: varchar('email').notNull().unique(),
    password: varchar('password').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    bannerUrl: varchar('banner_url'),
    avatarUrl: varchar('avatar_url'),
    isLegacy: boolean('is_legacy').default(false),
    biography: varchar('biography'),
  },
  table => {
    return {
      usernameLowerIdx: uniqueIndex('username_lower_idx').on(
        sql`LOWER(${table.username})`
      ),
      emailLowerIdx: uniqueIndex('email_lower_idx').on(
        sql`LOWER(${table.email})`
      ),
    }
  }
)

export const usersRelations = relations(users, ({ one, many }) => ({
  subscriptions: many(subscriptions),
  lists: many(lists),
  reviewReplies: many(reviewReplies),
  reviews: many(reviews),
  followers: many(followers, { relationName: 'followerRelation' }),
  following: many(followers, { relationName: 'followedRelation' }),
  likes: many(likes),
}))

export const userItems = pgTable(
  'user_items',
  {
    id: uuid('id').default(sql`gen_random_uuid()`).primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    tmdbId: integer('tmdb_id').notNull(),
    mediaType: mediaTypeEnum('media_type').notNull(),
    status: statusEnum('status').notNull(),
    addedAt: timestamp('added_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => sql`NOW()`),
  },
  userItems => ({
    uniqueUserItem: unique('user_items_userid_tmdbid_media_type_unique').on(
      userItems.userId,
      userItems.tmdbId,
      userItems.mediaType
    ),
  })
)

export const userItemsRelations = relations(userItems, ({ one }) => ({
  user: one(users, {
    fields: [userItems.userId],
    references: [users.id],
  }),
}))

export const magicTokens = pgTable(
  'magic_tokens',
  {
    id: uuid('id')
      .$defaultFn(() => randomUUID())
      .primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    token: varchar('token').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    used: boolean('used').default(false).notNull(),
  },
  table => {
    return {
      userIdIndex: index('token_user_id_idx').on(table.userId),
      tokenIndex: index('token_idx').on(table.token),
    }
  }
)

export const magicTokensRelations = relations(magicTokens, ({ one }) => ({
  user: one(users, {
    fields: [magicTokens.userId],
    references: [users.id],
  }),
}))

export const socialPlatformsEnum = pgEnum('social_platforms', [
  'INSTAGRAM',
  'TIKTOK',
  'YOUTUBE',
  'X', // Twitter/X
])

export const socialLinks = pgTable(
  'social_links',
  {
    id: uuid('id')
      .$defaultFn(() => randomUUID())
      .primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    platform: socialPlatformsEnum('platform').notNull(),
    url: varchar('url').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => {
    return {
      userPlatformUniqueConstraint: unique('user_platform_unique').on(
        table.userId,
        table.platform
      ),
    }
  }
)

export const socialLinksRelations = relations(socialLinks, ({ one }) => ({
  user: one(users, {
    fields: [socialLinks.userId],
    references: [users.id],
  }),
}))

export const userEpisodes = pgTable(
  'user_episodes',
  {
    id: uuid('id')
      .$defaultFn(() => randomUUID())
      .primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    tmdbId: integer('tmdb_id').notNull(),
    seasonNumber: integer('season_number').notNull(),
    episodeNumber: integer('episode_number').notNull(),
    watchedAt: timestamp('watched_at').defaultNow().notNull(),
    runtime: integer('runtime').notNull().default(0),
  },
  table => {
    return {
      uniqueEpisode: unique('user_episode_unique').on(
        table.userId,
        table.tmdbId,
        table.seasonNumber,
        table.episodeNumber
      ),
    }
  }
)

export const userEpisodesRelations = relations(userEpisodes, ({ one }) => ({
  user: one(users, {
    fields: [userEpisodes.userId],
    references: [users.id],
  }),
}))

export const likeEntityEnum = pgEnum('like_entity', ['REVIEW', 'REPLY', 'LIST'])

export const likes = pgTable(
  'likes',
  {
    id: uuid('id')
      .$defaultFn(() => randomUUID())
      .primaryKey(),
    entityId: uuid('entity_id').notNull(),
    entityType: likeEntityEnum('entity_type').notNull(),
    userId: uuid('user_id')
      .references(() => users.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  likes => ({
    entityIdIdx: index('idx_entity_id').on(likes.entityId),
  })
)

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
}))

export const userImports = pgTable('user_imports', {
  id: uuid('id')
    .$defaultFn(() => randomUUID())
    .primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  itemsCount: integer('items_count').notNull(),
  importStatus: importStatusEnum('import_status').notNull(),
  provider: providersEnum('provider').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const userImportsRelations = relations(userImports, ({ one, many }) => ({
  user: one(users, {
    fields: [userImports.userId],
    references: [users.id],
  }),
  ImportMovies: many(importMovies),
  importSeries: many(importSeries),
}))

export const importMovies = pgTable('import_movies', {
  id: uuid('id').primaryKey(),
  importId: uuid('import_id')
    .references(() => userImports.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name').notNull(),
  endDate: timestamp('end_date', { withTimezone: true }),
  userItemStatus: statusEnum('item_status').notNull(),
  importStatus: importItemStatusEnum('import_status').notNull(),
  tmdbId: integer('TMDB_ID'),
  __metadata: jsonb('__metadata').$type<object>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const importMoviesRelations = relations(importMovies, ({ one }) => ({
  import: one(userImports, {
    fields: [importMovies.importId],
    references: [userImports.id],
  }),
}))

export const importSeries = pgTable('import_series', {
  id: uuid('id').primaryKey(),
  importId: uuid('import_id')
    .references(() => userImports.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name').notNull(),
  startDate: timestamp('start_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),
  userItemStatus: statusEnum('item_status').notNull(),
  importStatus: importItemStatusEnum('import_status').notNull(),
  tmdbId: integer('TMDB_ID'),
  watchedEpisodes: integer('watched_episodes'),
  seriesEpisodes: integer('series_episodes'),
  __metadata: jsonb('__metadata').$type<object>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const importTVShowsRelations = relations(importSeries, ({ one }) => ({
  import: one(userImports, {
    fields: [importSeries.importId],
    references: [userImports.id],
  }),
}))

export const activityTypeEnum = pgEnum('activity_type', [
  'CREATE_LIST',
  'ADD_ITEM',
  'DELETE_ITEM',
  'LIKE_REVIEW',
  'LIKE_REPLY',
  'LIKE_LIST',
  'CREATE_REVIEW',
  'CREATE_REPLY',
  'FOLLOW_USER',
  'WATCH_EPISODE',
  'CHANGE_STATUS',
  'CREATE_ACCOUNT',
])

export const userActivities = pgTable(
  'user_activities',
  {
    id: uuid('id')
      .$defaultFn(() => randomUUID())
      .primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    activityType: activityTypeEnum('activity_type').notNull(),
    entityId: uuid('entity_id'),
    entityType: likeEntityEnum('entity_type'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  table => {
    return {
      userActivityIdx: index('user_activity_idx').on(
        table.userId,
        table.createdAt
      ),
    }
  }
)

export const userActivitiesRelations = relations(userActivities, ({ one }) => ({
  user: one(users, {
    fields: [userActivities.userId],
    references: [users.id],
  }),
}))

export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id')
      .$defaultFn(() => randomUUID())
      .primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    type: subscriptionTypeEnum('type').notNull(),
    status: subscriptionStatusEnum('status').default('ACTIVE').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    canceledAt: timestamp('canceled_at'),
    cancellationReason: varchar('cancellation_reason'),
  },
  table => ({
    activeSubscriptionIdx: uniqueIndex('active_subscription_idx')
      .on(table.userId)
      .where(eq(table.status, 'ACTIVE')),
  })
)

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}))

export const schema = {
  users,
  userItems,
  reviews,
  reviewReplies,
  lists,
  listItems,
  magicTokens,
  socialLinks,
  userEpisodes,
  likes,
  followers,
  userImports,
  importMovies,
  importSeries,
  userActivities,
  userPreferences,
  subscriptions,
  subscriptionTypeEnum,
}

export * from './user-preferences'
