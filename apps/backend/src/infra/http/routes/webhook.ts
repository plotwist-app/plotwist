import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { revenueCatWebhookController } from '../controllers/revenuecat-webhook-controller'
import { stripeWebhookController } from '../controllers/stripe-webhook-controller'

export async function webhookRoutes(app: FastifyInstance) {
  app.addContentTypeParser(
    'application/json',
    { parseAs: 'buffer' },
    (_req, body, done) => {
      try {
        done(null, body)
      } catch (error) {
        if (error instanceof Error) {
          done(error, undefined)
        }
      }
    }
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/complete-stripe-subscription',
      config: { rateLimit: false },
      schema: {
        description: 'Webhook route',
        tags: ['Webhook'],
      },
      handler: stripeWebhookController,
    })
  )

  app.after(() =>
    app.withTypeProvider<ZodTypeProvider>().route({
      method: 'POST',
      url: '/webhooks/revenuecat',
      config: { rateLimit: false },
      schema: {
        description: 'RevenueCat webhook for Apple IAP subscriptions',
        tags: ['Webhook'],
      },
      handler: revenueCatWebhookController,
    })
  )
}
