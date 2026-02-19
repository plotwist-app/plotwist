import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import type { schema } from '@/infra/db/schema'

export type Subscription = InferSelectModel<typeof schema.subscriptions>
export type InsertSubscriptionModel = InferInsertModel<
  typeof schema.subscriptions
>
