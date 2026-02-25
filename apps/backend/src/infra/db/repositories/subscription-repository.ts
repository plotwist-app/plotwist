import { and, desc, eq, or } from 'drizzle-orm'
import type { InsertSubscriptionModel } from '@/domain/entities/subscription'
import { db } from '@/infra/db'
import { schema } from '@/infra/db/schema'

export async function insertSubscription(params: InsertSubscriptionModel) {
  return db.insert(schema.subscriptions).values(params).returning()
}

export async function getActiveSubscriptionByUserId(userId: string) {
  return db.query.subscriptions.findFirst({
    where: and(
      eq(schema.subscriptions.userId, userId),
      eq(schema.subscriptions.status, 'ACTIVE')
    ),
  })
}

export async function getSubscriptionById(id: string) {
  return db.query.subscriptions.findFirst({
    where: eq(schema.subscriptions.id, id),
  })
}

export async function getSubscriptionByProviderSubscriptionId(
  providerSubscriptionId: string
) {
  return db.query.subscriptions.findFirst({
    where: eq(
      schema.subscriptions.providerSubscriptionId,
      providerSubscriptionId
    ),
  })
}

export type UpdateSubscriptionStatusByProviderSubscriptionIdParams = {
  status: 'ACTIVE' | 'CANCELED' | 'PENDING_CANCELLATION'
  canceledAt: Date | null
  cancellationReason: string | null
}

export async function updateSubscriptionStatusByProviderSubscriptionId(
  providerSubscriptionId: string,
  params: UpdateSubscriptionStatusByProviderSubscriptionIdParams
) {
  const [subscription] = await db
    .update(schema.subscriptions)
    .set({
      status: params.status,
      canceledAt: params.canceledAt,
      cancellationReason: params.cancellationReason,
    })
    .where(
      eq(schema.subscriptions.providerSubscriptionId, providerSubscriptionId)
    )
    .returning()

  return subscription
}

export type CancelSubscriptionParams = {
  id: string
  userId: string
  status: 'CANCELED' | 'PENDING_CANCELLATION'
  canceledAt: Date
  cancellationReason: string | undefined
}

export async function cancelUserSubscription(params: CancelSubscriptionParams) {
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

export async function getLastestActiveSubscription(userId: string) {
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
