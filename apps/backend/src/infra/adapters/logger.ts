import { SeverityNumber } from '@opentelemetry/api-logs'
import { getOtelLogger } from '@/infra/telemetry/otel'

type Attrs = Record<string, unknown>
type OtelAttrs = Record<string, string | number | boolean>

const SEVERITY = {
  debug: { number: SeverityNumber.DEBUG, text: 'DEBUG' },
  info: { number: SeverityNumber.INFO, text: 'INFO' },
  warn: { number: SeverityNumber.WARN, text: 'WARN' },
  error: { number: SeverityNumber.ERROR, text: 'ERROR' },
} as const

type Level = keyof typeof SEVERITY

function flattenValue(key: string, value: unknown, out: OtelAttrs) {
  if (value === undefined || value === null) return
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    out[key] = value
  } else if (value instanceof Error) {
    out[`${key}.type`] = value.name
    out[`${key}.message`] = value.message
    if (value.stack) out[`${key}.stacktrace`] = value.stack
  } else if (Array.isArray(value)) {
    out[key] = value.map(String).join(', ')
  } else {
    out[key] = JSON.stringify(value)
  }
}

function toOtelAttrs(obj: Attrs): OtelAttrs {
  const out: OtelAttrs = {}
  for (const [k, v] of Object.entries(obj)) flattenValue(k, v, out)
  return out
}

/**
 * Parses the flexible (attrs?, message, extra?) signature used across the
 * codebase into a normalized { message, attributes } pair.
 *
 * Supported call patterns:
 *   log('message')
 *   log({ key: 'val' }, 'message')
 *   log('message', error)
 *   log('message', extraData)
 */
function parseArgs(
  args: [string | Attrs, (string | unknown)?],
  bindings: Attrs
): { message: string; attributes: OtelAttrs } {
  const [first, second] = args
  const attrs: Attrs = { ...bindings }
  let message: string

  if (typeof first === 'object' && first !== null && !(first instanceof Error)) {
    Object.assign(attrs, first)
    message = typeof second === 'string' ? second : ''
  } else {
    message = String(first)
    if (second !== undefined) {
      if (second instanceof Error) {
        flattenValue('err', second, attrs as unknown as OtelAttrs)
      } else {
        flattenValue('detail', second, attrs as unknown as OtelAttrs)
      }
    }
  }

  return { message, attributes: toOtelAttrs(attrs) }
}

function emit(level: Level, message: string, attributes: OtelAttrs) {
  const { number: severityNumber, text: severityText } = SEVERITY[level]

  getOtelLogger().emit({
    severityNumber,
    severityText,
    body: message,
    attributes,
  })

  const line = JSON.stringify({ level: severityText, msg: message, ...attributes, time: new Date().toISOString() })
  process.stdout.write(`${line}\n`)
}

export interface Logger {
  debug(message: string): void
  debug(attrs: Attrs, message: string): void
  info(message: string): void
  info(attrs: Attrs, message: string): void
  info(message: string, detail: unknown): void
  warn(message: string): void
  warn(attrs: Attrs, message: string): void
  error(message: string): void
  error(attrs: Attrs, message: string): void
  error(message: string, error: unknown): void
  child(bindings: Attrs): Logger
}

function createLogger(bindings: Attrs = {}): Logger {
  function log(level: Level) {
    return (...args: [string | Attrs, (string | unknown)?]) => {
      const { message, attributes } = parseArgs(args, bindings)
      emit(level, message, attributes)
    }
  }

  return {
    debug: log('debug'),
    info: log('info'),
    warn: log('warn'),
    error: log('error'),
    child: (childBindings: Attrs) => createLogger({ ...bindings, ...childBindings }),
  }
}

export const logger = createLogger()
