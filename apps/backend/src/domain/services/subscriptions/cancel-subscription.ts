import type { Subscription } from '@/domain/entities/subscription'
import { DomainError } from '@/domain/errors/domain-error'
import { SubscriptionAlreadyCanceledError } from '@/domain/errors/subscription-already-canceled-error'
import { cancelUserSubscription } from '@/infra/db/repositories/subscription-repository'
import type { SubscriptionProvider } from '@/infra/ports/subscription-provider'

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
  } catch (error) {
    if (error instanceof SubscriptionAlreadyCanceledError) {
      await cancelUserSubscription({
        id,
        userId,
        status: 'CANCELED',
        canceledAt: new Date(),
        cancellationReason: reason,
      })
      return { id }
    }
    if (error instanceof DomainError) throw error
    throw new DomainError(
      `Failed to cancel subscription, ${error instanceof Error ? error.message : String(error)}`,
      500
    )
  }

  await cancelUserSubscription({
    id,
    userId,
    status: 'CANCELED',
    canceledAt: new Date(),
    cancellationReason: reason,
  })

  return { id }
}
