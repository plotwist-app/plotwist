import type { FastifyReply, FastifyRequest } from 'fastify'
import type Stripe from 'stripe'
import { stripe } from '@/adapters/stripe'
import { config } from '@/config'
import { completeSubscription } from '@/domain/services/subscriptions/complete-subscription'
import {
  handleSubscriptionDeleted,
  handleSubscriptionUpdated,
} from '@/domain/services/subscriptions/handle-subscription-webhook'

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
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const params = parseCheckoutSessionCompleted(session)
      if (params) {
        await completeSubscription({
          email: params.email,
          provider: 'STRIPE',
          providerSubscriptionId: params.providerSubscriptionId,
          type: 'PRO',
        })
      }
      break
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await handleSubscriptionDeleted(subscription)
      break
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      await handleSubscriptionUpdated(subscription)
      break
    }
    default:
      console.error(`Unhandled event type ${event.type}`)
  }

  return reply.status(200).send({ received: true })
}

function parseCheckoutSessionCompleted(
  object: Stripe.Checkout.Session
): { email: string; providerSubscriptionId: string | null } | null {
  const email =
    typeof object.customer_email === 'string' ? object.customer_email : null
  if (!email) return null

  const providerSubscriptionId =
    typeof object.subscription === 'string'
      ? object.subscription
      : (object.subscription?.id ?? null)

  return { email, providerSubscriptionId }
}
