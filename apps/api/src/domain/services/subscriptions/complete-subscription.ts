import { DomainError } from '@/domain/errors/domain-error'
import { getUserByEmailService } from '../users/get-user-by-email'

import { createSubscription } from '../subscriptions/create-subscription'
import { getLastestActiveSubscription } from './get-subscription'

export async function completeSubscription(email: string | null) {
  if (!email) return

  const result = await getUserByEmailService(email)
  if (result instanceof DomainError) {
    return result
  }

  const subscription = await getLastestActiveSubscription(result.user.id)

  if (subscription) {
    return { subscription }
  }

  const createSubscriptionResult = await createSubscription({
    type: 'PRO',
    userId: result.user.id,
  })

  if (createSubscriptionResult instanceof DomainError) {
    return createSubscriptionResult
  }

  return { subscription: createSubscriptionResult.subscription }
}
