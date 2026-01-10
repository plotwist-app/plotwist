import type { schema } from '@/db/schema'
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'

export type Subscription = InferSelectModel<typeof schema.subscriptions>
export type InsertSubscriptionModel = InferInsertModel<
  typeof schema.subscriptions
>
