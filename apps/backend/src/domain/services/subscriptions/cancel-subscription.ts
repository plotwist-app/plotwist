import { cancelUserSubscription } from '@/db/repositories/subscription-repository'
import type { Subscription } from '@/domain/entities/subscription'
import { DomainError } from '@/domain/errors/domain-error'
import { stripe } from '@/infra/adapters/stripe'

export async function cancelSubscription(
  { id, userId }: Subscription,
  reason: string | undefined
) {
  try {
    const subscription = await stripe.subscriptions.cancel(id)

    if (!subscription || subscription.status !== 'canceled') {
      throw new DomainError('Failed to cancel subscription', 500)
    }

    await cancelUserSubscription({
      id,
      userId,
      status: 'CANCELED',
      canceledAt: new Date(),
      cancellationReason: reason,
    })

    return {
      id,
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new DomainError(
        `Failed to cancel subscription, ${error.message}`,
        500
      )
    }

    throw new DomainError('Failed to cancel subscription', 500)
  }
}
