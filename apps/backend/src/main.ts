import '@/infra/telemetry/otel'

import { startServer } from '@/infra/http/server'
import { startMonitors } from '@/monitors/monitor'
import { startWorkers } from '@/workers/worker'

async function main() {
  startWorkers()
  startMonitors()
  await startServer()
}

main().catch(err => {
  console.error('Error initializing Plotwist', err)
})
