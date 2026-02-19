import { SQSAdapter } from '@/infra/adapters/sqs'
import type { QueueService } from '@/ports/queue-service'

type QueueProvider = 'SQS' | 'RABBITMQ'

export function queueServiceFactory(provider: QueueProvider): QueueService {
  switch (provider) {
    case 'SQS':
      return SQSAdapter

    // case 'RABBITMQ':
    // return RabbitMQ

    default:
      throw new Error(`Unsupported queue provider: ${provider}`)
  }
}
