import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type {
  togetherParticipants,
  togetherRooms,
  togetherSwipes,
} from '@/infra/db/schema/together'

export type TogetherRoom = InferSelectModel<typeof togetherRooms>
export type InsertTogetherRoom = InferInsertModel<typeof togetherRooms>

export type TogetherParticipant = InferSelectModel<typeof togetherParticipants>
export type InsertTogetherParticipant = InferInsertModel<
  typeof togetherParticipants
>

export type TogetherSwipe = InferSelectModel<typeof togetherSwipes>
export type InsertTogetherSwipe = InferInsertModel<typeof togetherSwipes>
