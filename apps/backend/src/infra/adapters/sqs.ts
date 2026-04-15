import {
  CreateQueueCommand,
  DeleteMessageCommand,
  type Message,
  ReceiveMessageCommand,
  SendMessageBatchCommand,
  SQSClient,
} from '@aws-sdk/client-sqs'
import { config } from '@/config'
import type { QueueMessage } from '@/domain/entities/queue-message'
import type { QueueService } from '@/infra/ports/queue-service'
import { logger } from './logger'

export const createSqsClient = () => {
  return new SQSClient({
    region: config.sqs.AWS_REGION,
    endpoint: config.sqs.LOCALSTACK_ENDPOINT || undefined,
    credentials: {
      accessKeyId: config.sqs.AWS_ACCESS_KEY_ID,
      secretAccessKey: config.sqs.AWS_SECRET_ACCESS_KEY,
    },
  })
}

export async function initializeSQS(sqsClient: SQSClient) {
  if (config.app.APP_ENV === 'production') {
    return
  }

  const queues = [
    config.sqsQueues.IMPORT_MOVIES_QUEUE,
    config.sqsQueues.IMPORT_SERIES_QUEUE,
  ]

  for (const queueName of queues) {
    try {
      const command = new CreateQueueCommand({ QueueName: queueName })

      const result = await sqsClient.send(command)
      logger.info(`Queue created or exists: ${result.QueueUrl}`)
    } catch (error) {
      logger.error(`Failed to create queue ${queueName}:`, error)
      throw error
    }
  }

  logger.info('All queues have been created.')
}

async function publish({ messages, queueUrl }: QueueMessage) {
  const sqsClient = createSqsClient()
  const MAX_BATCH_SIZE = 10 // SQS LIMIT

  const batches = []
  for (let i = 0; i < messages.length; i += MAX_BATCH_SIZE) {
    const batch = messages
      .slice(i, i + MAX_BATCH_SIZE)
      .map((message, index) => ({
        Id: `${i + index}`,
        MessageBody: JSON.stringify(message),
      }))
    batches.push(batch)
  }

  try {
    for (const batch of batches) {
      const command = new SendMessageBatchCommand({
        QueueUrl: queueUrl,
        Entries: batch,
      })

      const { Successful = [], Failed = [] } = await sqsClient.send(command)

      if (Successful.length) {
        logger.info(
          'Batch sent successfully:',
          Successful.map(msg => msg.Id)
        )
      } else {
        console.warn('No successful messages in batch.')
      }

      if (Failed.length) {
        console.error('Failed messages:', Failed)
      }
    }
  } catch (error) {
    console.error('Error while publishing to SQS:', error)
    throw error
  }
}

async function receiveMessage(
  queueUrl: string
): Promise<{ body: string | undefined; receiptHandle: string | undefined }[]> {
  const sqsClient = createSqsClient()

  const params = { QueueUrl: queueUrl, MaxNumberOfMessages: 10 }
  const result = await sqsClient.send(new ReceiveMessageCommand(params))

  return (
    result.Messages?.map((msg: Message) => ({
      body: msg.Body,
      receiptHandle: msg.ReceiptHandle,
    })) || []
  )
}

async function deleteMessage(queueUrl: string, receiptHandle: string) {
  const sqsClient = createSqsClient()

  sqsClient.send(
    new DeleteMessageCommand({
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle,
    })
  )
}

const SQSAdapter: QueueService = {
  publish: queueMessage => publish(queueMessage),
  receiveMessage: queueUrl => receiveMessage(queueUrl),
  initialize: () => initializeSQS(createSqsClient()),
  deleteMessage: (queueUrl, receiptHandle) =>
    deleteMessage(queueUrl, receiptHandle),
}

export { SQSAdapter }
