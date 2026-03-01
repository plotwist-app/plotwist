import { metrics } from '@opentelemetry/api'
import type { FastifyInstance } from 'fastify'

/**
 * Registers a lightweight request counter on top of the automatic telemetry
 * provided by @opentelemetry/instrumentation-http and @fastify/otel.
 *
 * - http.server.request.duration (histogram) is emitted automatically by
 *   instrumentation-http following OTel semantic conventions.
 * - Span status ERROR + exception recording on 5xx is handled automatically
 *   by instrumentation-http (sets status) and @fastify/otel (recordExceptions).
 * - This counter adds a simple `http.server.requests` metric useful for
 *   quick rate-of-requests queries without histogram overhead.
 */
export function registerHttpRequestMetrics(app: FastifyInstance) {
  const meter = metrics.getMeter('plotwist-api', '0.1.0')
  const requestCounter = meter.createCounter('http.server.requests', {
    description: 'Total HTTP server requests',
    unit: '1',
  })

  app.addHook('onResponse', (request, reply, done) => {
    const statusCode = reply.statusCode
    requestCounter.add(1, {
      'http.response.status_code': statusCode,
      'http.request.method': request.method,
      'http.route': request.routeOptions?.url ?? request.url,
    })
    done()
  })
}
