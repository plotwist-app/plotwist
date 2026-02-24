import type { FastifyReply, FastifyRequest } from 'fastify'
import { StripeSubscriptionProvider } from '@/adapters/stripe-subscription-provider'
import { DomainError } from '@/domain/errors/domain-error'
import { cancelSubscription } from '@/domain/services/subscriptions/cancel-subscription'
import { getSubscription } from '@/domain/services/subscriptions/get-subscription'
import { scheduleCancellation } from '@/domain/services/subscriptions/schedule-subscription-cancellation'
import { deleteSubscriptionBodySchema } from '../schemas/subscriptions'

const subscriptionProvider = StripeSubscriptionProvider

export async function deleteSubscriptionController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { when, reason } = deleteSubscriptionBodySchema.parse(request.body)

  const id = request.user.id

  const subscription = await getSubscription(id)

  if (subscription instanceof DomainError) {
    return reply
      .status(subscription.status)
      .send({ message: subscription.message })
  }

  switch (when) {
    case 'now':
      await cancelSubscription(subscription, reason, subscriptionProvider)
      break
    case 'at_end_of_current_period':
      await scheduleCancellation(subscription, reason, subscriptionProvider)
      break
    default:
      return reply.status(400).send({ message: 'Invalid when parameter' })
  }

  return reply.status(200).send({ message: 'Subscription cancelled' })
}
