import { DomainError } from '@/domain/errors/domain-error'
import { createSubscription } from '../subscriptions/create-subscription'
import { getUserByEmailService } from '../users/get-user-by-email'
import { getLastestActiveSubscription } from './get-subscription'

export type CompleteSubscriptionParams = {
  email: string
  provider: 'STRIPE' | 'APPLE'
  providerSubscriptionId: string | null
  type: 'PRO' | 'MEMBER'
}

export async function completeSubscription(params: CompleteSubscriptionParams) {
  const result = await getUserByEmailService(params.email)
  if (result instanceof DomainError) {
    return result
  }

  const existing = await getLastestActiveSubscription(result.user.id)
  if (existing) {
    return { subscription: existing }
  }

  const createSubscriptionResult = await createSubscription({
    type: params.type,
    userId: result.user.id,
    provider: params.provider,
    providerSubscriptionId: params.providerSubscriptionId,
  })

  if (createSubscriptionResult instanceof DomainError) {
    return createSubscriptionResult
  }

  return { subscription: createSubscriptionResult.subscription }
}
