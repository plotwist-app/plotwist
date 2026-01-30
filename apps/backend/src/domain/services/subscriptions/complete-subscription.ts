import type Stripe from 'stripe'
import { DomainError } from '@/domain/errors/domain-error'
import { createSubscription } from '../subscriptions/create-subscription'
import { getUserByEmailService } from '../users/get-user-by-email'
import { getLastestActiveSubscription } from './get-subscription'

export async function completeSubscription(session: Stripe.Checkout.Session) {
  const email =
    typeof session.customer_email === 'string' ? session.customer_email : null
  if (!email) return

  const result = await getUserByEmailService(email)
  if (result instanceof DomainError) {
    return result
  }

  const existing = await getLastestActiveSubscription(result.user.id)
  if (existing) {
    return { subscription: existing }
  }

  const stripeSubscriptionId =
    typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id ?? null

  const createSubscriptionResult = await createSubscription({
    type: 'PRO',
    userId: result.user.id,
    stripeSubscriptionId,
  })

  if (createSubscriptionResult instanceof DomainError) {
    return createSubscriptionResult
  }

  return { subscription: createSubscriptionResult.subscription }
}
