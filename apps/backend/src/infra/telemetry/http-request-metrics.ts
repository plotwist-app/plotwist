import { metrics } from '@opentelemetry/api'
import type { FastifyInstance } from 'fastify'

function getStatusClass(statusCode: number): 'ok' | 'error' {
  return statusCode >= 200 && statusCode < 400 ? 'ok' : 'error'
}

const DURATION_BOUNDARIES_MS = [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000]

export function registerHttpRequestMetrics(app: FastifyInstance) {
  const meter = metrics.getMeter('plotwist-api', '0.1.0')
  const requestCounter = meter.createCounter('http.server.requests', {
    description: 'HTTP server request count by status',
    unit: '1',
  })
  const requestDuration = meter.createHistogram(
    'http.server.request.duration',
    {
      description: 'HTTP server request duration',
      unit: 's',
    },
    DURATION_BOUNDARIES_MS.map(ms => ms / 1000)
  )

  app.addHook('onRequest', (request, _reply, done) => {
    ;(request as { _startTime?: number })._startTime = Date.now()
    done()
  })

  app.addHook('onResponse', (request, reply, done) => {
    const statusCode = reply.statusCode
    const statusClass = getStatusClass(statusCode)
    const startTime = (request as { _startTime?: number })._startTime
    const durationSec =
      typeof startTime === 'number' ? (Date.now() - startTime) / 1000 : 0

    requestCounter.add(1, {
      'http.status_code': statusCode,
      'http.response.status': statusClass,
      'http.method': request.method,
      'http.route': request.routeOptions?.url ?? request.url,
    })
    requestDuration.record(durationSec, {
      'http.response.status': statusClass,
      'http.method': request.method,
      'http.route': request.routeOptions?.url ?? request.url,
    })
    done()
  })
}
