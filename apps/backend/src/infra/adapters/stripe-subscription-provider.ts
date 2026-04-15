import { SubscriptionAlreadyCanceledError } from '@/domain/errors/subscription-already-canceled-error'
import { stripe } from '@/infra/adapters/stripe'
import type { SubscriptionProvider } from '@/infra/ports/subscription-provider'

async function scheduleCancelAtPeriodEnd(
  providerSubscriptionId: string
): Promise<Date> {
  const updated = await stripe.subscriptions.update(providerSubscriptionId, {
    cancel_at_period_end: true,
  })
  const cancelAt = (updated as unknown as { cancel_at: number | null })
    .cancel_at
  if (!cancelAt) {
    const items = (
      updated as unknown as {
        items: { data: { current_period_end: number }[] }
      }
    ).items.data
    return new Date(items[0].current_period_end * 1000)
  }
  return new Date(cancelAt * 1000)
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
  scheduleCancelAtPeriodEnd,
  cancelImmediately,
}
