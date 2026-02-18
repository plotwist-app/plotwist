import { trace } from '@opentelemetry/api'

// biome-ignore lint/suspicious/noExplicitAny: generic HOF must accept any service signature
export function withServiceTracing<T extends (...args: any[]) => any>(
  spanName: string,
  fn: T
): T {
  const tracer = trace.getTracer('plotwist-api', '0.1.0')
  const fullSpanName = spanName.endsWith('-service')
    ? spanName
    : `${spanName}-service`

  return (async (...args: Parameters<T>) => {
    return tracer.startActiveSpan(fullSpanName, async span => {
      try {
        const result = await fn(...args)
        return result
      } catch (err) {
        span.recordException(err as Error)
        throw err
      } finally {
        span.end()
      }
    })
  }) as T
}
