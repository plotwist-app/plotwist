import cron from 'node-cron'
import { config } from '@/config'
import { logger } from '@/infra/adapters/logger'
import { monitorTodayNewUsers } from './new-users'
import { monitorTodayNewSubscriptions } from './today-new-subscriptions'
import { monitorTotalItemsAdded } from './total-items-added'
import { monitorTotalSubscriptions } from './total-subscriptions'
import { monitorTotalUsers } from './total-users'

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

    logger.info('Monitoring total subscriptions')
    void monitorTotalSubscriptions().catch(err => {
      logger.error('Monitor total subscriptions failed:', err)
    })

    logger.info('Monitoring total items added')
    void monitorTotalItemsAdded().catch(err => {
      logger.error('Monitor total items added failed:', err)
    })

    logger.info('Monitoring today new users')
    void monitorTodayNewUsers().catch(err => {
      logger.error('Monitor today new users failed:', err)
    })

    logger.info('Monitoring today new subscriptions')
    void monitorTodayNewSubscriptions().catch(err => {
      logger.error('Monitor today new subscriptions failed:', err)
    })
  })
}
