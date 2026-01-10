import { SQSAdapter } from '@/adapters/sqs'
import type { Message } from '@aws-sdk/client-sqs'

export async function consumeMessages(
  queueUrl: string,
  processMessage: (message: string, receiptHandle: string) => Promise<void>
) {
  while (true) {
    try {
      const messages = await SQSAdapter.receiveMessage(queueUrl)

      if (messages && messages.length > 0) {
        handleMessages(
          messages.map(msg => ({
            Body: msg.body,
            ReceiptHandle: msg.receiptHandle,
          })) satisfies Message[],
          processMessage
        )
      }
      await delay(2000)
    } catch (error) {
      console.error(`Error consuming messages from queue: ${queueUrl}`, error)
    }
  }
}

async function handleMessages(
  messages: Message[],
  processMessage: (message: string, receiptHandle: string) => Promise<void>
) {
  for (const messageObj of messages) {
    const { Body: body, ReceiptHandle: receiptHandle } = messageObj

    if (typeof body === 'string' && typeof receiptHandle === 'string') {
      try {
        await processMessage(body, receiptHandle)
      } catch (error) {
        console.error(`Error processing message: ${body}`, error)
      }
    } else {
      console.warn('Received message or receiptHandle is invalid:', messageObj)
    }
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
