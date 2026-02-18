import { trace } from '@opentelemetry/api'
import type { FastifyRequest } from 'fastify'

// biome-ignore lint/suspicious/noExplicitAny: generic HOF must accept any handler signature
export function withTracing<T extends (...args: any[]) => any>(
  spanName: string,
  handler: T,
  options?: { method?: string; url?: string }
): T {
  const tracer = trace.getTracer('plotwist-api', '0.1.0')
  const fullSpanName = spanName.endsWith('-controller')
    ? spanName
    : `${spanName}-controller`

  return (async (...args: Parameters<T>) => {
    return tracer.startActiveSpan(fullSpanName, async span => {
      try {
        const request = args[0] as FastifyRequest | undefined
        if (request) {
          span.setAttribute('http.method', options?.method ?? request.method)
          span.setAttribute(
            'http.url',
            options?.url ?? request.routeOptions?.url ?? request.url ?? ''
          )
        }

        const result = await handler(...args)
        span.setAttribute('http.status_code', 200)
        return result
      } catch (err) {
        span.recordException(err as Error)
        span.setAttribute('http.status_code', 500)
        throw err
      } finally {
        span.end()
      }
    })
  }) as T
}
