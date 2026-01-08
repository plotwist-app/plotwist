import type { QueueMessage } from '@/domain/entities/queue-message'

export interface QueueService {
  initialize(): Promise<void>
  publish(queueMessage: QueueMessage): Promise<void>
  receiveMessage(
    queueUrl: string
  ): Promise<{ body: string | undefined; receiptHandle: string | undefined }[]>
  deleteMessage(queueUrl: string, receiptHandle: string): Promise<void>
}
