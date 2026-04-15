import { randomUUID } from 'node:crypto'
import { relations } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'
import { users } from '.'

export const achievementCategoryEnum = pgEnum('achievement_category', [
  'general',
  'saga',
])

export type AchievementCriteria =
  | { type: 'ITEMS_WATCHED'; mediaType?: 'MOVIE' | 'TV_SHOW' }
  | { type: 'ITEMS_IN_COLLECTION'; mediaType?: 'MOVIE' | 'TV_SHOW' }
  | { type: 'REVIEWS_WRITTEN' }
  | { type: 'FOLLOWERS_COUNT' }
  | { type: 'FOLLOWING_COUNT' }
  | { type: 'LISTS_CREATED' }
  | { type: 'FAVORITES_COUNT' }
  | { type: 'EPISODES_WATCHED' }
  | { type: 'TMDB_SET'; tmdbIds: number[]; mediaType: 'MOVIE' | 'TV_SHOW' }

export type I18nField = Record<string, string>

export const achievements = pgTable('achievements', {
  id: uuid('id')
    .$defaultFn(() => randomUUID())
    .primaryKey(),
  slug: text('slug').notNull().unique(),
  icon: text('icon').notNull(),
  target: integer('target').notNull(),
  category: achievementCategoryEnum('category').notNull().default('general'),
  level: integer('level').notNull().default(1),
  criteria: jsonb('criteria').$type<AchievementCriteria>().notNull(),
  name: jsonb('name').$type<I18nField>().notNull(),
  description: jsonb('description').$type<I18nField>().notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const userAchievements = pgTable(
  'user_achievements',
  {
    id: uuid('id')
      .$defaultFn(() => randomUUID())
      .primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    achievementId: uuid('achievement_id')
      .references(() => achievements.id, { onDelete: 'cascade' })
      .notNull(),
    isClaimed: boolean('is_claimed').notNull().default(false),
    isEquipped: boolean('is_equipped').notNull().default(false),
    claimedAt: timestamp('claimed_at'),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    uniqueUserAchievement: unique('user_achievement_unique').on(
      table.userId,
      table.achievementId
    ),
    userIdx: index('idx_user_achievements_user').on(table.userId),
    achievementIdx: index('idx_user_achievements_achievement').on(
      table.achievementId
    ),
  })
)

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}))

export const userAchievementsRelations = relations(
  userAchievements,
  ({ one }) => ({
    user: one(users, {
      fields: [userAchievements.userId],
      references: [users.id],
    }),
    achievement: one(achievements, {
      fields: [userAchievements.achievementId],
      references: [achievements.id],
    }),
  })
)
