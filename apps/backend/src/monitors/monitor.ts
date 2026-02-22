import cron from 'node-cron'
import { config } from '@/config'
import { logger } from '@/infra/adapters/logger'
import { monitorTotalUsers } from './total_users'

export function startMonitors() {
  if (config.monitors.ENABLE_MONITORS === 'false') {
    return
  }

  const cronTime = config.monitors.MONITOR_CRON_TIME
  logger.info('Monitors started')

  cron.schedule(cronTime, () => {
    logger.info('Monitoring total users')
    void monitorTotalUsers().catch(err => {
      logger.error('Monitor total users failed:', err)
    })
  })
}
