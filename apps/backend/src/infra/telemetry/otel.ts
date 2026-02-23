import FastifyOtel from '@fastify/otel'
import { metrics, trace } from '@opentelemetry/api'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import { HostMetrics } from '@opentelemetry/host-metrics'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { NodeSDK } from '@opentelemetry/sdk-node'
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions'
import { config } from '@/config'
import { logger } from '../adapters/logger'

const otlpMetricsEndpoint = config.telemetry.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT
const otlpTracesEndpoint = config.telemetry.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT

const otlpHeaders =
  config.app.APP_ENV === 'production'
    ? parseOtlpHeaders(config.telemetry.OTEL_EXPORTER_OTLP_HEADERS)
    : {}

function parseOtlpHeaders(raw: string | undefined): Record<string, string> {
  if (!raw?.trim()) return {}
  const out: Record<string, string> = {}
  for (const part of raw.split(',')) {
    const eq = part.indexOf('=')
    if (eq === -1) continue
    const key = part.slice(0, eq).trim()
    const value = part.slice(eq + 1).trim()
    if (key && value) out[key] = value
  }
  return out
}

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'plotwist-api',
    [ATTR_SERVICE_VERSION]: '0.1.0',
  }),
  traceExporter: new OTLPTraceExporter({
    url: otlpTracesEndpoint,
    headers: otlpHeaders,
  }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: otlpMetricsEndpoint,
      headers: otlpHeaders,
    }),
  }),
})

logger.info('Starting OTLP exporter')

sdk.start()

const meterProvider = metrics.getMeterProvider()
const hostMetrics = new HostMetrics({
  meterProvider,
  metricGroups: [
    'process.cpu',
    'process.memory',
    'system.cpu',
    'system.memory',
    'system.network',
  ],
})
hostMetrics.start()

const fastifyOtel = new FastifyOtel()
fastifyOtel.setTracerProvider(trace.getTracerProvider())

export { fastifyOtel }
