import { metrics } from '@opentelemetry/api'

const METER_NAME = 'plotwist-api'
const METER_VERSION = '0.1.0'
const GAUGE_NAME = 'plotwist_monitor'

export const monitorMetricNames = {
  totalUsers: 'total_users',
  totalSubscriptions: 'total_subscriptions',
  totalItemsAdded: 'total_items_added',
  todayNewUsers: 'today_new_users',
  todayNewSubscriptions: 'today_new_subscriptions',
} as const

const store: Partial<Record<(typeof monitorMetricNames)[keyof typeof monitorMetricNames], number>> = {}

function getMeter() {
  return metrics.getMeter(METER_NAME, METER_VERSION)
}

function registerGauge() {
  const meter = getMeter()
  const gauge = meter.createObservableGauge(GAUGE_NAME, {
    description: 'Monitor values (total users, subscriptions, etc.)',
    unit: '1',
  })
  gauge.addCallback(result => {
    for (const [name, value] of Object.entries(store)) {
      if (typeof value === 'number') {
        result.observe(value, { monitor: name })
      }
    }
  })
}

let initialized = false
function ensureInitialized() {
  if (!initialized) {
    registerGauge()
    initialized = true
  }
}

export function setMonitorMetric(
  name: (typeof monitorMetricNames)[keyof typeof monitorMetricNames],
  value: number
) {
  ensureInitialized()
  store[name] = value
}
