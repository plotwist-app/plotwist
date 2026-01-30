import { stripe } from '@/adapters/stripe'
import type { SubscriptionProvider } from '@/ports/subscription-provider'

async function getCurrentPeriodEnd(providerSubscriptionId: string) {
  const retrieved = await stripe.subscriptions.retrieve(providerSubscriptionId)
  const periodEndTimestamp = (
    retrieved as unknown as { current_period_end: number }
  ).current_period_end
  return new Date(periodEndTimestamp * 1000)
}

async function scheduleCancelAtPeriodEnd(
  providerSubscriptionId: string,
  periodEnd: Date
) {
  await stripe.subscriptions.update(providerSubscriptionId, {
    cancel_at: Math.floor(periodEnd.getTime() / 1000),
    cancel_at_period_end: true,
  })
}

async function cancelImmediately(providerSubscriptionId: string) {
  await stripe.subscriptions.cancel(providerSubscriptionId)
}

export const StripeSubscriptionProvider: SubscriptionProvider = {
  getCurrentPeriodEnd,
  scheduleCancelAtPeriodEnd,
  cancelImmediately,
}
