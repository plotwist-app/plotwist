import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { schema } from '@/infra/db/schema'

export type UserEpisode = InferSelectModel<typeof schema.userEpisodes>
export type InsertUserEpisode = Pick<
  InferInsertModel<typeof schema.userEpisodes>,
  'seasonNumber' | 'episodeNumber' | 'tmdbId' | 'userId' | 'runtime'
>
