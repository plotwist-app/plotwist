import type { ProvidersEnum } from '@/@types/media-type-enum'
import type { ImportMovie } from '@/domain/entities/import-movies'
import type { MovieWithMediaType } from '@plotwist_app/tmdb'
import type { ListResponse } from '@plotwist_app/tmdb/dist/utils/list-response'

import { config } from '@/config'
import { updateImportMoviesStatus } from '@/db/repositories/import-movies-repository'
import { searchTMDBMovie } from '@/domain/services/tmdb/search-tmdb-movie'
import { consumeMessages } from './consumer'

import type { MALAnimes } from '@/@types/my-anime-list-import'
import { searchAnimeById } from '@/adapters/my-anime-list'
import { getImportMovieById } from '@/domain/services/imports/get-import-movie-by-id'
import { upsertUserItemService } from '@/domain/services/user-items/upsert-user-item'
import { queueServiceFactory } from '@/factories/queue-service-factory'
import type { QueueService } from '@/ports/queue-service'

type ImportMovieMessage = {
  id: string
  name: string
  provider: ProvidersEnum
  userId: string
}
export async function startMovieConsumer() {
  const movieQueueUrl = config.sqsQueues.IMPORT_MOVIES_QUEUE

  const processMovieMessage = async (
    message: string,
    receiptHandle: string
  ) => {
    try {
      const { id, name, provider, userId }: ImportMovieMessage =
        JSON.parse(message)

      const movie = await getImportMovieById(id)

      const tmdbId = await processMovie(movie, name, provider)

      const messageAdapter = queueServiceFactory('SQS')

      if (!tmdbId) {
        return await failProcessing(
          movieQueueUrl,
          receiptHandle,
          id,
          messageAdapter
        )
      }

      await completeProcessing(
        movieQueueUrl,
        receiptHandle,
        tmdbId,
        movie,
        userId,
        messageAdapter
      )
    } catch (error) {
      console.error('Failed to process message:', error)
    }
  }

  await consumeMessages(movieQueueUrl, processMovieMessage)
}

async function processMovie(
  movie: ImportMovie,
  name: string,
  provider: ProvidersEnum
) {
  const tmdbResult = await searchTMDBMovie(name)
  const moviesOnly = {
    ...tmdbResult,
    results: tmdbResult.results.filter(item => item.media_type === 'movie'),
  } satisfies ListResponse<MovieWithMediaType>

  return await handleResult(movie, provider, moviesOnly)
}

async function failProcessing(
  queueUrl: string,
  receiptHandle: string,
  movieId: string,
  messageAdapter: QueueService
) {
  await updateImportMoviesStatus(movieId, 'FAILED')
  await messageAdapter.deleteMessage(queueUrl, receiptHandle)
}

async function completeProcessing(
  queueUrl: string,
  receiptHandle: string,
  tmdbId: number,
  movie: ImportMovie,
  userId: string,
  messageAdapter: QueueService
) {
  await upsertUserItemService({
    mediaType: 'MOVIE',
    status: movie.userItemStatus,
    tmdbId,
    userId,
  })

  await updateImportMoviesStatus(movie.id, 'COMPLETED')
  await messageAdapter.deleteMessage(queueUrl, receiptHandle)
}

async function handleResult(
  movie: ImportMovie,
  provider: ProvidersEnum,
  tmdbResult: ListResponse<MovieWithMediaType>
) {
  if (tmdbResult.total_results === 0) return null

  if (tmdbResult.total_results === 1) return tmdbResult.results[0].id

  switch (provider) {
    case 'MY_ANIME_LIST':
      return await handleMyAnimeList(movie, tmdbResult)
    case 'LETTERBOXD':
      return await handleLetterboxd(movie, tmdbResult)
  }
}

async function handleMyAnimeList(
  movie: ImportMovie,
  tmdbResult: ListResponse<MovieWithMediaType>
) {
  const metadata = movie.__metadata as MALAnimes

  const { start_date } = await searchAnimeById(
    metadata.series_animedb_id.toString()
  )

  const matchedResults = tmdbResult.results.filter(
    result => result.release_date === start_date
  )

  return matchedResults.length === 1 ? matchedResults[0].id : null
}

async function handleLetterboxd(
  movie: ImportMovie,
  tmdbResult: ListResponse<MovieWithMediaType>
) {
  const metadata = movie.__metadata as {
    Date: string
    Name: string
    Year: string
    'Letterboxd URI': string
  }

  const matchedResults = tmdbResult.results.filter(result =>
    compareDate(result.release_date, metadata.Year)
  )

  return matchedResults.length === 1 ? matchedResults[0].id : null
}

function compareDate(releaseDate: string, year: string) {
  if (!releaseDate) {
    return false
  }

  if (!year) {
    return false
  }

  releaseDate.split('-')[0] === year
}
