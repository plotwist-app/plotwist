import { config } from '@/config'
import { logger } from '@/infra/adapters/logger'
import { createSqsClient, initializeSQS } from '@/infra/adapters/sqs'
import { startMovieConsumer } from '@/infra/consumers/movies-consumer'
import { startSeriesConsumer } from '@/infra/consumers/series-consumer'

export async function startWorkers() {
  startSQS()
  startCronJobs()
}

async function startConsumers() {
  if (config.featureFlags.ENABLE_IMPORT_MOVIES === 'true') {
    startMovieConsumer()
  }

  if (config.featureFlags.ENABLE_IMPORT_SERIES === 'true') {
    startSeriesConsumer()
  }
}

async function startSQS() {
  if (config.featureFlags.ENABLE_SQS === 'true') {
    const sqsClient = createSqsClient()
    await initializeSQS(sqsClient)

    startConsumers().catch(error => {
      logger.error('Error starting consumers', error)
      process.exit(1)
    })
  }
}

async function startCronJobs() {
  if (config.featureFlags.ENABLE_CRON_JOBS === 'true') {
    // No cron jobs currently configured
  }
}
