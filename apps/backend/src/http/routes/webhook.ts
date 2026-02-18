import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

import { withTracing } from '@/infra/telemetry/with-tracing'

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
      handler: withTracing('stripe-webhook', stripeWebhookController),
    })
  )
}
