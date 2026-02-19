import { DeleteQueueCommand, ReceiveMessageCommand } from '@aws-sdk/client-sqs'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { config } from '@/config'
import { createSqsClient, initializeSQS } from '@/infra/adapters/sqs'
import { makeManyRawImportMovies } from '@/test/factories/make-import-movies'
import { makeManyRawImportSeries } from '@/test/factories/make-import-series'
import { makeUser } from '@/test/factories/make-user'
import { makeUserImport } from '@/test/factories/make-user-import'
import { publishToQueue } from './publish-import-to-queue'

describe('publishToQueue', () => {
  let sqsClient: ReturnType<typeof createSqsClient>

  const queues = [
    config.sqsQueues.IMPORT_MOVIES_QUEUE,
    config.sqsQueues.IMPORT_SERIES_QUEUE,
  ]

  beforeEach(async () => {
    sqsClient = createSqsClient()
    await initializeSQS(sqsClient)
  })

  afterEach(async () => {
    for (const queue of queues) {
      await sqsClient.send(
        new DeleteQueueCommand({
          QueueUrl: `http://localhost:4566/000000000000/${queue}`,
        })
      )
    }
  })

  it('should be able to send messages to SQS', async () => {
    const { id: userId } = await makeUser({})

    const movies = makeManyRawImportMovies(3, {})
    const series = makeManyRawImportSeries(8, {})
    const result = await makeUserImport({ userId, movies, series })

    await publishToQueue(result)

    const receiveMovies = {
      QueueUrl: config.sqsQueues.IMPORT_MOVIES_QUEUE,
      MaxNumberOfMessages: 3,
      WaitTimeSeconds: 1,
    }

    const receivedMovies = await sqsClient.send(
      new ReceiveMessageCommand(receiveMovies)
    )

    expect(receivedMovies.Messages).toHaveLength(3)

    const receiveSeries = {
      QueueUrl: config.sqsQueues.IMPORT_SERIES_QUEUE,
      MaxNumberOfMessages: 8,
      WaitTimeSeconds: 1,
    }

    const receivedSeries = await sqsClient.send(
      new ReceiveMessageCommand(receiveSeries)
    )

    expect(receivedSeries.Messages).toHaveLength(8)

    const firstSerie = result.series[0]
    const formattedSeries = {
      id: firstSerie.id,
      name: firstSerie.name,
      provider: result.provider,
      userId,
    }

    expect(receivedSeries.Messages?.[0].Body).toBe(
      JSON.stringify(formattedSeries)
    )
  })

  // it('should not be able to publish movies when it is empty', async () => {
  //   const { id: userId } = await makeUser({})

  //   const series = makeManyRawImportSeries(3, {})
  //   const result = await makeUserImport({ userId, movies: [], series })

  //   await publishToQueue(result)

  //   const receiveMovies = {
  //     QueueUrl: config.sqsQueues.IMPORT_MOVIES_QUEUE,
  //     MaxNumberOfMessages: 1,
  //     WaitTimeSeconds: 1,
  //   }

  //   const receiveSeries = {
  //     QueueUrl: config.sqsQueues.IMPORT_SERIES_QUEUE,
  //     MaxNumberOfMessages: 3,
  //     WaitTimeSeconds: 1,
  //   }

  //   const receivedMovies = await sqsClient.send(
  //     new ReceiveMessageCommand(receiveMovies)
  //   )

  //   const receivedSeries = await sqsClient.send(
  //     new ReceiveMessageCommand(receiveSeries)
  //   )

  //   expect(receivedMovies.Messages).toBeUndefined()
  //   expect(receivedSeries.Messages).toHaveLength(3)
  // })

  // it('should not be able to publish series when it is empty', async () => {
  //   const { id: userId } = await makeUser({})

  //   const movies = makeManyRawImportMovies(3, {})
  //   const result = await makeUserImport({ userId, movies, series: [] })

  //   await publishToQueue(result)

  //   const receiveMovies = {
  //     QueueUrl: config.sqsQueues.IMPORT_MOVIES_QUEUE,
  //     MaxNumberOfMessages: 3,
  //     WaitTimeSeconds: 1,
  //   }

  //   const receiveSeries = {
  //     QueueUrl: config.sqsQueues.IMPORT_SERIES_QUEUE,
  //     MaxNumberOfMessages: 1,
  //     WaitTimeSeconds: 0.1,
  //   }

  //   const receivedMovies = await sqsClient.send(
  //     new ReceiveMessageCommand(receiveMovies)
  //   )

  //   const receivedSeries = await sqsClient.send(
  //     new ReceiveMessageCommand(receiveSeries)
  //   )

  //   expect(receivedMovies.Messages).toHaveLength(3)
  //   expect(receivedSeries.Messages).toBeUndefined()
  // })
}, 10000)
