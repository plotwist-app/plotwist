import { cancelUserSubscription } from '@/db/repositories/subscription-repository'
import type { Subscription, Subscription } from '@/domain/entities/subscription'
import { DomainError, DomainError } from '@/domain/errors/domain-error'
import { stripe } from '@/infra/adapters/stripe'
import { cancelUserSubscription } from '@/infra/db/repositories/subscription-repository'
import type { SubscriptionProvider } from '@/ports/subscription-provider'

export async function scheduleCancellation(
  { id: subscriptionId, userId, providerSubscriptionId }: Subscription,
  reason: string | undefined,
  provider: SubscriptionProvider
) {
  if (!providerSubscriptionId) {
    throw new DomainError(
      'Cannot schedule cancellation: subscription has no provider subscription id',
      400
    )
  }

  try {
    const canceledAt = await provider.getCurrentPeriodEnd(
      providerSubscriptionId
    )
    await provider.scheduleCancelAtPeriodEnd(providerSubscriptionId, canceledAt)

    const scheduledCancellation = await cancelUserSubscription({
      id: subscriptionId,
      userId,
      status: 'PENDING_CANCELLATION',
      canceledAt,
      cancellationReason: reason,
    })

    return scheduledCancellation
  } catch (error) {
    if (error instanceof DomainError) throw error
    throw new DomainError(
      `Failed to schedule subscription cancellation, ${error instanceof Error ? error.message : String(error)}`,
      500
    )
  }
}
