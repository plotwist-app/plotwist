import type { FastifyReply, FastifyRequest } from 'fastify'
import type Stripe from 'stripe'
import { config } from '@/config'
import { DomainError } from '@/domain/errors/domain-error'
import { completeSubscription } from '@/domain/services/subscriptions/complete-subscription'
import {
  handleSubscriptionDeleted,
  handleSubscriptionUpdated,
} from '@/domain/services/subscriptions/handle-subscription-webhook'
import { logger } from '@/infra/adapters/logger'
import { stripe } from '@/infra/adapters/stripe'

const webhookSecret =
  config.services.STRIPE_WEBHOOK_SECRET || config.services.STRIPE_SECRET_KEY

export async function stripeWebhookController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const stripeSignature = request.headers['stripe-signature']
  if (!stripeSignature) {
    logger.warn(
      { method: request.method, url: request.url, statusCode: 400 },
      'Stripe webhook: missing signature'
    )
    return reply.status(400).send('Missing Stripe signature.')
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      request.body as string,
      stripeSignature,
      webhookSecret
    )
  } catch (error) {
    logger.error(
      {
        err: error instanceof Error ? error : new Error(String(error)),
        method: request.method,
        url: request.url,
        route: request.routeOptions?.url,
        userId: request.user?.id,
        statusCode: 400,
      },
      'Stripe webhook: signature verification failed'
    )
    return reply.status(400).send(`Webhook Error: ${error}`)
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== 'subscription') break
      const params = parseCheckoutSessionCompleted(session)
      if (params) {
        const result = await completeSubscription({
          email: params.email,
          provider: 'STRIPE',
          providerSubscriptionId: params.providerSubscriptionId,
          type: 'PRO',
        })
        if (result instanceof DomainError) {
          logger.warn(
            { eventId: event.id, error: result.message },
            'checkout.session.completed: completeSubscription returned error'
          )
        }
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
      logger.info({ eventType: event.type }, 'Unhandled Stripe webhook event')
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
