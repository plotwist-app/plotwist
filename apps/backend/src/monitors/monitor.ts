import cron from 'node-cron'
import { config } from '@/config'
import { logger } from '@/infra/adapters/logger'
import {
  monitorMetricNames,
  setMonitorMetric,
} from '@/infra/telemetry/monitor-metrics'
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
    void monitorTotalUsers()
      .then(v => {
        if (v != null) setMonitorMetric(monitorMetricNames.totalUsers, v)
      })
      .catch(err => logger.error('Monitor total users failed:', err))

    logger.info('Monitoring total subscriptions')
    void monitorTotalSubscriptions()
      .then(v => {
        if (v != null)
          setMonitorMetric(monitorMetricNames.totalSubscriptions, v)
      })
      .catch(err => logger.error('Monitor total subscriptions failed:', err))

    logger.info('Monitoring total items added')
    void monitorTotalItemsAdded()
      .then(v => {
        if (v != null) setMonitorMetric(monitorMetricNames.totalItemsAdded, v)
      })
      .catch(err => logger.error('Monitor total items added failed:', err))

    logger.info('Monitoring today new users')
    void monitorTodayNewUsers()
      .then(v => {
        if (v != null) setMonitorMetric(monitorMetricNames.todayNewUsers, v)
      })
      .catch(err => logger.error('Monitor today new users failed:', err))

    logger.info('Monitoring today new subscriptions')
    void monitorTodayNewSubscriptions()
      .then(v => {
        if (v != null)
          setMonitorMetric(monitorMetricNames.todayNewSubscriptions, v)
      })
      .catch(err =>
        logger.error('Monitor today new subscriptions failed:', err)
      )
  })
}
