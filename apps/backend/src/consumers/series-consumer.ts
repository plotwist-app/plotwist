import type { TvSerieWithMediaType } from '@plotwist_app/tmdb'
import type { ListResponse } from '@plotwist_app/tmdb/dist/utils/list-response'
import type { ProvidersEnum } from '@/@types/media-type-enum'
import type { MALAnimes } from '@/@types/my-anime-list-import'
import { searchAnimeById } from '@/adapters/my-anime-list'
import { config } from '@/config'
import { updateImportSeriesStatus } from '@/db/repositories/import-series-repository'
import type { ImportSeries } from '@/domain/entities/import-series'
import { getImportSeriesById } from '@/domain/services/imports/get-import-series-by-id'
import { searchTMDBMovie } from '@/domain/services/tmdb/search-tmdb-movie'
import { upsertUserItemService } from '@/domain/services/user-items/upsert-user-item'
import { queueServiceFactory } from '@/factories/queue-service-factory'
import type { QueueService } from '@/ports/queue-service'
import { consumeMessages } from './consumer'

type ImportseriesMessage = {
  id: string
  name: string
  provider: ProvidersEnum
  userId: string
}

export async function startSeriesConsumer() {
  const seriesQueueUrl = config.sqsQueues.IMPORT_SERIES_QUEUE

  const processseriesMessage = async (
    message: string,
    receiptHandle: string
  ) => {
    try {
      const { id, name, provider, userId }: ImportseriesMessage =
        JSON.parse(message)

      const series = await getImportSeriesById(id)

      const tmdbId = await processSeries(series, name, provider)

      const messageAdapter = queueServiceFactory('SQS')

      if (!tmdbId) {
        return await failProcessing(
          seriesQueueUrl,
          receiptHandle,
          id,
          messageAdapter
        )
      }

      await completeProcessing(
        seriesQueueUrl,
        receiptHandle,
        tmdbId,
        series,
        userId,
        messageAdapter
      )
    } catch (error) {
      console.error('Failed to process message:', error)
    }
  }

  await consumeMessages(seriesQueueUrl, processseriesMessage)
}

async function processSeries(
  series: ImportSeries,
  name: string,
  provider: ProvidersEnum
) {
  const tmdbResult = await searchTMDBMovie(name)
  const seriesOnly = {
    ...tmdbResult,
    results: tmdbResult.results.filter(item => item.media_type === 'tv'),
  } satisfies ListResponse<TvSerieWithMediaType>

  return await handleResult(series, provider, seriesOnly)
}

async function failProcessing(
  queueUrl: string,
  receiptHandle: string,
  seriesId: string,
  messageAdapter: QueueService
) {
  await updateImportSeriesStatus(seriesId, 'FAILED')
  await messageAdapter.deleteMessage(queueUrl, receiptHandle)
}

async function completeProcessing(
  queueUrl: string,
  receiptHandle: string,
  tmdbId: number,
  series: ImportSeries,
  userId: string,
  messageAdapter: QueueService
) {
  await upsertUserItemService({
    mediaType: 'TV_SHOW',
    status: series.userItemStatus,
    tmdbId,
    userId,
  })
  await updateImportSeriesStatus(series.id, 'COMPLETED')
  await messageAdapter.deleteMessage(queueUrl, receiptHandle)
}
async function handleResult(
  series: ImportSeries,
  provider: ProvidersEnum,
  tmdbResult: ListResponse<TvSerieWithMediaType>
) {
  if (tmdbResult.total_results === 0) return null

  if (tmdbResult.total_results === 1) return tmdbResult.results[0].id

  switch (provider) {
    case 'MY_ANIME_LIST':
      return await handleMyAnimeList(series, tmdbResult)
  }
}

async function handleMyAnimeList(
  series: ImportSeries,
  tmdbResult: ListResponse<TvSerieWithMediaType>
) {
  const { series_animedb_id } = series.__metadata as MALAnimes

  const anime = await searchAnimeById(series_animedb_id.toString())

  const matchedResults = tmdbResult.results.filter(
    result => result.first_air_date === anime.start_date
  )

  return matchedResults.length === 1 ? matchedResults[0].id : null
}
