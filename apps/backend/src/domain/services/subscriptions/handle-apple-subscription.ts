import { logger } from '@/infra/adapters/logger'
import {
  getSubscriptionByProviderSubscriptionId,
  updateSubscriptionStatusByProviderSubscriptionId,
} from '@/infra/db/repositories/subscription-repository'

export async function handleAppleSubscriptionEvent(
  appUserId: string,
  eventType: string
) {
  const row = await getSubscriptionByProviderSubscriptionId(appUserId)
  if (!row) {
    logger.info(
      { appUserId, eventType },
      'Apple subscription not found for provider id'
    )
    return
  }

  switch (eventType) {
    case 'CANCELLATION':
      await updateSubscriptionStatusByProviderSubscriptionId(appUserId, {
        status: 'PENDING_CANCELLATION',
        canceledAt: new Date(),
        cancellationReason: null,
      })
      break

    case 'EXPIRATION':
      await updateSubscriptionStatusByProviderSubscriptionId(appUserId, {
        status: 'EXPIRED',
        canceledAt: new Date(),
        cancellationReason: null,
      })
      break
  }
}
