import type { FastifyReply, FastifyRequest } from 'fastify'
import type Stripe from 'stripe'
import { config } from '@/config'
import { completeSubscription } from '@/domain/services/subscriptions/complete-subscription'
import { stripe } from '@/infra/adapters/stripe'

export async function stripeWebhookController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const stripeSignature = request.headers['stripe-signature']
  if (!stripeSignature) {
    return reply.status(400).send('Missing Stripe signature.')
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      request.body as string,
      stripeSignature,
      config.services.STRIPE_SECRET_KEY
    )
  } catch (error) {
    return reply.status(400).send(`Webhook Error: ${error}`)
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await completeSubscription(event.data.object.customer_email)
      break

    default:
      console.error(`Unhandled event type ${event.type}`)
  }

  return reply.status(200).send({ received: true })
}
