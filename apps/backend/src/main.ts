import { startServer } from './http/server'
import { startWorkers } from './worker'

async function main() {
  startWorkers()
  startServer()
}

main().catch(err => {
  console.error('Error initializing Plotwist', err)
})
