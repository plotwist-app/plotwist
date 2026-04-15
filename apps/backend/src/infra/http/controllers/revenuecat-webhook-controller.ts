import type { FastifyReply, FastifyRequest } from 'fastify'
import { config } from '@/config'
import { DomainError } from '@/domain/errors/domain-error'
import { completeSubscription } from '@/domain/services/subscriptions/complete-subscription'
import { handleAppleSubscriptionEvent } from '@/domain/services/subscriptions/handle-apple-subscription'
import { logger } from '@/infra/adapters/logger'

interface RevenueCatEvent {
  type: string
  app_user_id: string
  original_app_user_id: string
  product_id: string
  environment: string
  subscriber_attributes?: {
    $email?: { value: string }
  }
  expiration_at_ms?: number
  event_timestamp_ms: number
}

interface RevenueCatWebhookBody {
  api_version: string
  event: RevenueCatEvent
}

export async function revenueCatWebhookController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authHeader = request.headers.authorization
  const expectedToken = config.services.REVENUECAT_WEBHOOK_SECRET
  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }

  const body = request.body as RevenueCatWebhookBody
  const event = body?.event
  if (!event) {
    return reply.status(400).send({ message: 'Missing event' })
  }

  const email = event.subscriber_attributes?.$email?.value
  const appUserId = event.app_user_id

  logger.info(
    { type: event.type, appUserId, environment: event.environment },
    'RevenueCat webhook received'
  )

  switch (event.type) {
    case 'INITIAL_PURCHASE':
    case 'RENEWAL':
    case 'PRODUCT_CHANGE': {
      if (!email) {
        logger.warn(
          { appUserId },
          'RevenueCat: no email in subscriber attributes'
        )
        break
      }
      const result = await completeSubscription({
        email,
        provider: 'APPLE',
        providerSubscriptionId: appUserId,
        type: 'PRO',
      })
      if (result instanceof DomainError) {
        logger.warn(
          { eventType: event.type, error: result.message },
          'RevenueCat: completeSubscription error'
        )
      }
      break
    }

    case 'CANCELLATION':
    case 'EXPIRATION': {
      await handleAppleSubscriptionEvent(appUserId, event.type)
      break
    }

    default:
      logger.info({ eventType: event.type }, 'Unhandled RevenueCat event')
  }

  return reply.status(200).send({ received: true })
}
