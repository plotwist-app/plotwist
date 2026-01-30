import { stripe } from '@/adapters/stripe'
import { cancelUserSubscription } from '@/db/repositories/subscription-repository'
import type { Subscription } from '@/domain/entities/subscription'
import { DomainError } from '@/domain/errors/domain-error'

export async function scheduleCancellation(
  { id: subscriptionId, userId, providerSubscriptionId }: Subscription,
  paymentDay: number,
  reason: string | undefined
) {
  const providerSubscriptionIdToUpdate =
    providerSubscriptionId ?? subscriptionId
  try {
    const expirationDate = await calculateSubscriptionExpiration(paymentDay)

    const subscription = await updateStripeSubscription(
      providerSubscriptionIdToUpdate,
      expirationDate.getTime(),
      true
    )

    if (!subscription) {
      throw new DomainError('Failed to schedule subscription cancellation', 500)
    }

    const scheduledCancellation = await cancelUserSubscription({
      id: subscriptionId,
      userId,
      status: 'PENDING_CANCELLATION',
      canceledAt: expirationDate,
      cancellationReason: reason,
    })

    return scheduledCancellation
  } catch (error) {
    return new DomainError(
      `Failed to schedule subscription cancellation, ${error instanceof Error ? error.message : String(error)}`,
      500
    )
  }
}

async function updateStripeSubscription(
  providerSubscriptionId: string,
  date: number | null,
  cancelAtPeriodEnd: boolean
) {
  const subscription = await stripe.subscriptions.update(
    providerSubscriptionId,
    {
      cancel_at: date,
      cancel_at_period_end: cancelAtPeriodEnd,
    }
  )

  return subscription
}

async function calculateSubscriptionExpiration(paymentDay: number) {
  const currentDate = new Date()
  const currentDay = currentDate.getDate()
  const currentMonth =
    currentDay < paymentDay
      ? currentDate.getMonth()
      : currentDate.getMonth() + 1

  return new Date(currentDate.getFullYear(), currentMonth, paymentDay - 1)
}
