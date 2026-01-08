import { stripe } from '@/adapters/stripe'
import { cancelUserSubscription } from '@/db/repositories/subscription-repository'
import type { Subscription } from '@/domain/entities/subscription'
import { DomainError } from '@/domain/errors/domain-error'

export async function scheduleCancellation(
  { id: subscriptionId, userId }: Subscription,
  paymentDay: number,
  reason: string | undefined
) {
  try {
    const expirationDate = await calculateSubscriptionExpiration(paymentDay)

    const subscription = await updateSubscription(
      subscriptionId,
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
    return new DomainError('Failed to schedule subscription cancellation', 500)
  }
}

async function updateSubscription(
  subscriptionId: string,
  date: number | null,
  cancelAtPeriodEnd: boolean
) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at: date,
    cancel_at_period_end: cancelAtPeriodEnd,
  })

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
