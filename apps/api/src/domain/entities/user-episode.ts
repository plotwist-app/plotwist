import type { schema } from '@/db/schema'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'

export type UserEpisode = InferSelectModel<typeof schema.userEpisodes>
export type InsertUserEpisode = Pick<
  InferInsertModel<typeof schema.userEpisodes>,
  'seasonNumber' | 'episodeNumber' | 'tmdbId' | 'userId' | 'runtime'
>
