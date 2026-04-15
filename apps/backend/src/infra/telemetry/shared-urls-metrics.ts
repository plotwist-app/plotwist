import { metrics } from '@opentelemetry/api'

/**
 * Same pattern as http-request-metrics: create the counter once at registration
 * time with plotwist-api / 0.1.0 meter. Call registerSharedUrlsMetrics() from
 * server startup (next to registerHttpRequestMetrics).
 */

let urlsShortenedCounter: ReturnType<
  ReturnType<typeof metrics.getMeter>['createCounter']
> | null = null

export function registerSharedUrlsMetrics() {
  const meter = metrics.getMeter('plotwist-api', '0.1.0')
  urlsShortenedCounter = meter.createCounter('urls_shortened_total', {
    description: 'Total number of URLs shortened',
    unit: '1',
  })
}

export function recordUrlShortened() {
  if (urlsShortenedCounter === null) {
    // Fallback if register was skipped (e.g. tests)
    registerSharedUrlsMetrics()
  }
  const counter = urlsShortenedCounter
  if (counter) {
    counter.add(1, { service: 'plotwist-api' })
  }
}
