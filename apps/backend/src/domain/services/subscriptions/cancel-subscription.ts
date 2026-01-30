import { cancelUserSubscription } from '@/db/repositories/subscription-repository'
import type { Subscription } from '@/domain/entities/subscription'
import { DomainError } from '@/domain/errors/domain-error'
import type { SubscriptionProvider } from '@/ports/subscription-provider'

export async function cancelSubscription(
  { id, userId, providerSubscriptionId }: Subscription,
  reason: string | undefined,
  provider: SubscriptionProvider
) {
  if (!providerSubscriptionId) {
    throw new DomainError(
      'Cannot cancel: subscription has no provider subscription id',
      400
    )
  }

  try {
    await provider.cancelImmediately(providerSubscriptionId)

    await cancelUserSubscription({
      id,
      userId,
      status: 'CANCELED',
      canceledAt: new Date(),
      cancellationReason: reason,
    })

    return { id }
  } catch (error) {
    if (error instanceof DomainError) throw error
    throw new DomainError(
      `Failed to cancel subscription, ${error instanceof Error ? error.message : String(error)}`,
      500
    )
  }
}
