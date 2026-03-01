import FastifyOtel from '@fastify/otel'
import { metrics, trace } from '@opentelemetry/api'
import { logs } from '@opentelemetry/api-logs'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import { HostMetrics } from '@opentelemetry/host-metrics'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { BatchLogRecordProcessor, LoggerProvider } from '@opentelemetry/sdk-logs'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { NodeSDK } from '@opentelemetry/sdk-node'
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions'
import { config } from '@/config'

const LOCALHOST_OTLP = 'http://localhost:4318'

function getOtlpConfig() {
  const isProduction = config.app.APP_ENV === 'production'
  const base =
    isProduction && config.telemetry.OTEL_EXPORTER_OTLP_ENDPOINT?.trim()
      ? resolveBaseUrl(config.telemetry.OTEL_EXPORTER_OTLP_ENDPOINT.trim())
      : LOCALHOST_OTLP
  const isRemote = base !== LOCALHOST_OTLP
  const headers =
    isRemote && config.telemetry.OTEL_EXPORTER_OTLP_HEADERS?.trim()
      ? parseOtlpHeaders(config.telemetry.OTEL_EXPORTER_OTLP_HEADERS)
      : {}

  return {
    metricsUrl: `${base}/v1/metrics`,
    tracesUrl: `${base}/v1/traces`,
    logsUrl: `${base}/v1/logs`,
    headers,
  }
}

function resolveBaseUrl(endpoint: string): string {
  if (endpoint === 'localhost' || endpoint === '127.0.0.1')
    return LOCALHOST_OTLP
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://'))
    return endpoint.replace(/\/$/, '')
  return `http://${endpoint}:4318`
}

function parseOtlpHeaders(raw: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const part of raw.split(',')) {
    const eq = part.indexOf('=')
    if (eq === -1) continue
    const key = part.slice(0, eq).trim()
    const value = part
      .slice(eq + 1)
      .trim()
      .replace(/%20/g, ' ')
    if (key) out[key] = value
  }
  return out
}

const { metricsUrl, tracesUrl, logsUrl, headers } = getOtlpConfig()

const httpInstrumentation = new HttpInstrumentation()

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'plotwist-api',
    [ATTR_SERVICE_VERSION]: '0.1.0',
  }),
  traceExporter: new OTLPTraceExporter({ url: tracesUrl, headers }),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({ url: metricsUrl, headers }),
  }),
  instrumentations: [httpInstrumentation],
})

const logResource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: 'plotwist-api',
  [ATTR_SERVICE_VERSION]: '0.1.0',
})
const logExporter = new OTLPLogExporter({ url: logsUrl, headers })
const loggerProvider = new LoggerProvider({
  resource: logResource,
  processors: [new BatchLogRecordProcessor(logExporter)],
})
logs.setGlobalLoggerProvider(loggerProvider)

function getOtelLogger() {
  return logs.getLogger('plotwist-api', '0.1.0')
}

console.log('Starting OTLP exporter (traces, metrics, logs)')

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

export { fastifyOtel, getOtelLogger }
