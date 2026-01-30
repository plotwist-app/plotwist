import type Stripe from 'stripe'
import {
  getSubscriptionByStripeSubscriptionId,
  updateSubscriptionStatusByStripeId,
} from '@/db/repositories/subscription-repository'

/**
 * Handles customer.subscription.deleted webhook.
 * Payload: event.data.object is a Stripe Subscription with id (sub_xxx), status 'canceled', canceled_at (unix).
 */
export async function handleSubscriptionDeleted(
  stripeSubscription: Stripe.Subscription
) {
  const row = await getSubscriptionByStripeSubscriptionId(stripeSubscription.id)
  if (!row) return

  await updateSubscriptionStatusByStripeId(stripeSubscription.id, {
    status: 'CANCELED',
    canceledAt: stripeSubscription.canceled_at
      ? new Date(stripeSubscription.canceled_at * 1000)
      : new Date(),
    cancellationReason: null,
  })
}

/**
 * Handles customer.subscription.updated webhook.
 * Payload: event.data.object is a Stripe Subscription with cancel_at_period_end, cancel_at (unix).
 * When cancel_at_period_end is true → PENDING_CANCELLATION; when false (reactivation) → ACTIVE.
 */
export async function handleSubscriptionUpdated(
  stripeSubscription: Stripe.Subscription
) {
  const row = await getSubscriptionByStripeSubscriptionId(stripeSubscription.id)
  if (!row) return

  if (stripeSubscription.cancel_at_period_end && stripeSubscription.cancel_at) {
    await updateSubscriptionStatusByStripeId(stripeSubscription.id, {
      status: 'PENDING_CANCELLATION',
      canceledAt: new Date(stripeSubscription.cancel_at * 1000),
      cancellationReason: null,
    })
  } else {
    await updateSubscriptionStatusByStripeId(stripeSubscription.id, {
      status: 'ACTIVE',
      canceledAt: null,
      cancellationReason: null,
    })
  }
}
