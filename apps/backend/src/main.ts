import '@/infra/telemetry/otel'

import { startServer } from '@/infra/http/server'
import { startWorkers } from '@/workers/worker'
import { startMonitors } from '@/monitors/monitor'

async function main() {
  startWorkers()
  startMonitors()
  await startServer()
}

main().catch(err => {
  console.error('Error initializing Plotwist', err)
})
