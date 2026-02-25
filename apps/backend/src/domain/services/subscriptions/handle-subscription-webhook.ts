import type Stripe from 'stripe'
import {
  getSubscriptionByProviderSubscriptionId,
  updateSubscriptionStatusByProviderSubscriptionId,
} from '@/infra/db/repositories/subscription-repository'

/**
 * Handles customer.subscription.deleted webhook.
 * Payload: event.data.object is a Stripe Subscription with id (sub_xxx), status 'canceled', canceled_at (unix).
 */
export async function handleSubscriptionDeleted(
  stripeSubscription: Stripe.Subscription
) {
  const row = await getSubscriptionByProviderSubscriptionId(
    stripeSubscription.id
  )
  if (!row) return

  await updateSubscriptionStatusByProviderSubscriptionId(
    stripeSubscription.id,
    {
      status: 'CANCELED',
      canceledAt: stripeSubscription.canceled_at
        ? new Date(stripeSubscription.canceled_at * 1000)
        : new Date(),
      cancellationReason: null,
    }
  )
}

type StripeSubscriptionPayload = Stripe.Subscription & {
  current_period_end?: number
}

/**
 * Handles customer.subscription.updated webhook.
 * Payload: event.data.object is a Stripe Subscription with cancel_at_period_end, cancel_at (unix), current_period_end, status.
 * When cancel_at_period_end is true → PENDING_CANCELLATION; when false and status is active → ACTIVE (reactivation).
 */
export async function handleSubscriptionUpdated(
  stripeSubscription: StripeSubscriptionPayload
) {
  const row = await getSubscriptionByProviderSubscriptionId(
    stripeSubscription.id
  )
  if (!row) return

  if (stripeSubscription.cancel_at_period_end) {
    const canceledAtTimestamp =
      stripeSubscription.cancel_at ??
      stripeSubscription.current_period_end ??
      Math.floor(Date.now() / 1000)
    await updateSubscriptionStatusByProviderSubscriptionId(
      stripeSubscription.id,
      {
        status: 'PENDING_CANCELLATION',
        canceledAt: new Date(canceledAtTimestamp * 1000),
        cancellationReason: null,
      }
    )
    return
  }

  if (stripeSubscription.status === 'active') {
    await updateSubscriptionStatusByProviderSubscriptionId(
      stripeSubscription.id,
      {
        status: 'ACTIVE',
        canceledAt: null,
        cancellationReason: null,
      }
    )
  }
}
