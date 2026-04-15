import { DomainError } from '@/domain/errors/domain-error'
import {
  getActiveSubscriptionByUserId,
  getLastestActiveSubscription as getLatest,
} from '@/infra/db/repositories/subscription-repository'

export async function getSubscription(id: string) {
  const subscription = await getActiveSubscriptionByUserId(id)

  if (!subscription) {
    return new DomainError('Subscription not found', 404)
  }

  return subscription
}

export async function getLastestActiveSubscription(userId: string) {
  const subscription = await getLatest(userId)

  if (!subscription) {
    return null
  }

  return subscription
}
