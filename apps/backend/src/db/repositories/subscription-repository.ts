import { and, desc, eq, or } from 'drizzle-orm'
import { db } from '@/db'
import { schema } from '@/db/schema'
import type { InsertSubscriptionModel } from '@/domain/entities/subscription'
import { withDbTracing } from '@/infra/telemetry/with-db-tracing'

const insertSubscriptionImpl = async (params: InsertSubscriptionModel) => {
  return db.insert(schema.subscriptions).values(params).returning()
}

export const insertSubscription = withDbTracing(
  'insert-subscription',
  insertSubscriptionImpl
)

const getActiveSubscriptionByUserIdImpl = async (userId: string) => {
  return db.query.subscriptions.findFirst({
    where: and(
      eq(schema.subscriptions.userId, userId),
      eq(schema.subscriptions.status, 'ACTIVE')
    ),
  })
}

export const getActiveSubscriptionByUserId = withDbTracing(
  'get-active-subscription-by-user-id',
  getActiveSubscriptionByUserIdImpl
)

const getSubscriptionByIdImpl = async (id: string) => {
  return db.query.subscriptions.findFirst({
    where: eq(schema.subscriptions.id, id),
  })
}

export const getSubscriptionById = withDbTracing(
  'get-subscription-by-id',
  getSubscriptionByIdImpl
)

export type CancelSubscriptionParams = {
  id: string
  userId: string
  status: 'CANCELED' | 'PENDING_CANCELLATION'
  canceledAt: Date
  cancellationReason: string | undefined
}

const cancelUserSubscriptionImpl = async (
  params: CancelSubscriptionParams
) => {
  const [subscription] = await db
    .update(schema.subscriptions)
    .set({
      status: params.status,
      canceledAt: params.canceledAt,
      cancellationReason: params.cancellationReason,
    })
    .where(
      and(
        eq(schema.subscriptions.id, params.id),
        eq(schema.subscriptions.userId, params.userId)
      )
    )
    .returning()

  return subscription
}

export const cancelUserSubscription = withDbTracing(
  'cancel-user-subscription',
  cancelUserSubscriptionImpl
)

const updateSubscriptionImpl = async (
  userId: string,
  type: 'PRO' | 'MEMBER'
) => {
  return db
    .update(schema.subscriptions)
    .set({ type })
    .where(eq(schema.subscriptions.userId, userId))
    .returning()
}

export const updateSubscription = withDbTracing(
  'update-subscription',
  updateSubscriptionImpl
)

const getLastestActiveSubscriptionImpl = async (userId: string) => {
  const [subscription] = await db
    .select()
    .from(schema.subscriptions)
    .where(
      and(
        eq(schema.subscriptions.userId, userId),
        or(
          eq(schema.subscriptions.status, 'ACTIVE'),
          eq(schema.subscriptions.status, 'PENDING_CANCELLATION')
        )
      )
    )
    .orderBy(desc(schema.subscriptions.createdAt))
    .limit(1)

  if (!subscription) {
    return null
  }

  return subscription
}

export const getLastestActiveSubscription = withDbTracing(
  'get-lastest-active-subscription',
  getLastestActiveSubscriptionImpl
)
