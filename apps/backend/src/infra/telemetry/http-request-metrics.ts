import { metrics } from '@opentelemetry/api'
import type { FastifyInstance } from 'fastify'

function getStatusClass(statusCode: number): 'ok' | 'error' {
  return statusCode >= 200 && statusCode < 400 ? 'ok' : 'error'
}

export function registerHttpRequestMetrics(app: FastifyInstance) {
  const meter = metrics.getMeter('plotwist-api', '0.1.0')
  const requestCounter = meter.createCounter('http.server.requests', {
    description: 'HTTP server request count by status',
    unit: '1',
  })

  app.addHook('onResponse', (request, reply, done) => {
    const statusCode = reply.statusCode
    const statusClass = getStatusClass(statusCode)
    requestCounter.add(1, {
      'http.status_code': statusCode,
      'http.response.status': statusClass,
      'http.method': request.method,
      'http.route': request.routeOptions?.url ?? request.url,
    })
    done()
  })
}
