import { integer, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'
import { users } from './index'

export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  watchProvidersIds: integer('watch_providers_ids').array(),
  watchRegion: text('watch_region'),
  mediaTypes: text('media_types').array(),
  genreIds: integer('genre_ids').array(),
})

export const insertUserPreferencesSchema = createInsertSchema(userPreferences)
