import type { FastifyRequest, FastifyReply } from 'fastify'
import { deleteSubscriptionBodySchema } from '../schemas/subscriptions'
import { DomainError } from '@/domain/errors/domain-error'
import { getSubscription } from '@/domain/services/subscriptions/get-subscription'
import { cancelSubscription } from '@/domain/services/subscriptions/cancel-subscription'
import { scheduleCancellation } from '@/domain/services/subscriptions/schedule-subscription-cancellation'
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
      await cancelSubscription(subscription, reason)
      break
    case 'at_end_of_current_period':
      // TODO: get the payment day from the subscription
      await scheduleCancellation(subscription, 1, reason)
      break
    default:
      return reply.status(400).send({ message: 'Invalid when parameter' })
  }

  return reply.status(200).send({ message: 'Subscription cancelled' })
}
