import '@/infra/telemetry/otel'

import { logger } from '@/infra/adapters/logger'
import { startServer } from '@/infra/http/server'
import { startMonitors } from '@/monitors/monitor'
import { startWorkers } from '@/workers/worker'

async function main() {
  startWorkers()
  startMonitors()
  await startServer()
}

main().catch(err => {
  logger.error('Error initializing Plotwist', err)
})
