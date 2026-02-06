import { describe, expect, it } from 'vitest'
import { config } from '@/config'
import { makeManyRawImportMovies } from '@/test/factories/make-import-movies'
import { makeManyRawImportSeries } from '@/test/factories/make-import-series'
import { makeUser } from '@/test/factories/make-user'
import { makeUserImport } from '@/test/factories/make-user-import'
import { publishToQueue } from './publish-import-to-queue'

const mockPublish = vi.fn().mockResolvedValue(undefined)

vi.mock('@/factories/queue-service-factory', () => ({
  queueServiceFactory: () => ({
    publish: mockPublish,
  }),
}))

describe('publishToQueue', () => {
  beforeEach(() => {
    mockPublish.mockClear()
  })

  it('should publish movies and series to their queues', async () => {
    const { id: userId } = await makeUser({})

    const movies = makeManyRawImportMovies(3, {})
    const series = makeManyRawImportSeries(8, {})
    const result = await makeUserImport({ userId, movies, series })

    await publishToQueue(result)

    await vi.waitFor(() => {
      expect(mockPublish).toHaveBeenCalledTimes(2)
    })

    const [moviesCall, seriesCall] = mockPublish.mock.calls

    expect(moviesCall[0].queueUrl).toBe(config.sqsQueues.IMPORT_MOVIES_QUEUE)
    expect(moviesCall[0].messages).toHaveLength(3)
    expect(moviesCall[0].messages).toEqual(
      result.movies.map(({ id, name }) => ({
        id,
        name,
        provider: result.provider,
        userId,
      }))
    )

    expect(seriesCall[0].queueUrl).toBe(config.sqsQueues.IMPORT_SERIES_QUEUE)
    expect(seriesCall[0].messages).toHaveLength(8)
    expect(seriesCall[0].messages).toEqual(
      result.series.map(({ id, name }) => ({
        id,
        name,
        provider: result.provider,
        userId,
      }))
    )
  })
})
