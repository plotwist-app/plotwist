import { stripe } from '@/adapters/stripe'
import { SubscriptionAlreadyCanceledError } from '@/domain/errors/subscription-already-canceled-error'
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
  try {
    await stripe.subscriptions.cancel(providerSubscriptionId)
  } catch (error: unknown) {
    const stripeError = error as { code?: string; message?: string }
    const isAlreadyCanceled =
      stripeError.code === 'resource_already_canceled' ||
      /already canceled|cannot cancel.*canceled/i.test(
        String(stripeError.message ?? '')
      )
    if (isAlreadyCanceled) {
      throw new SubscriptionAlreadyCanceledError()
    }
    throw error
  }
}

export const StripeSubscriptionProvider: SubscriptionProvider = {
  getCurrentPeriodEnd,
  scheduleCancelAtPeriodEnd,
  cancelImmediately,
}
