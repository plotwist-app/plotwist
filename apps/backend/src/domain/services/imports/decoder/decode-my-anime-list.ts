import type { MultipartFile } from '@fastify/multipart'
import {
  type MALAnimes,
  type MyAnimeListImport,
  SeriesType,
} from '@/@types/my-anime-list-import'
import type {
  DetailedUserImport,
  InsertUserImportWithItems,
} from '@/domain/entities/import'
import type { InsertImportMovie } from '@/domain/entities/import-movies'
import type { InsertImportSeries } from '@/domain/entities/import-series'
import { DomainError } from '@/domain/errors/domain-error'
import { MALtoDomain } from '@/domain/helpers/convert_status'
import { unzipFile } from '@/domain/helpers/decompress-gzip-file'
import { convertXmlToJson } from '@/domain/helpers/xml-to-json'
import { createUserImport } from '../create-user-import'

export async function decodeMyAnimeList(
  userId: string,
  uploadedFile: MultipartFile
): Promise<DetailedUserImport | DomainError> {
  try {
    const unzippedContent = await unzipFile(uploadedFile)
    const parsedFile = convertXmlToJson<MyAnimeListImport>(unzippedContent)

    const { movies: rawMovies, series: rawSeries } = separateByType(
      parsedFile.myanimelist.anime
    )

    const series = buildSeries(rawSeries)
    const movies = buildMovies(rawMovies)
    const userImport = {
      itemsCount: series.length + movies.length,
      provider: 'MY_ANIME_LIST',
      userId,
      importStatus: 'NOT_STARTED',
      movies,
      series,
    } satisfies InsertUserImportWithItems

    return await createUserImport(userImport)
  } catch (error) {
    if (error instanceof DomainError) {
      return error
    }

    return new DomainError('An unexpected error occurred', 500)
  }
}

function separateByType(mediaArray: MALAnimes[]) {
  const series = mediaArray.filter(
    item => item.series_type === SeriesType.SERIES
  )
  const movies = mediaArray.filter(
    item => item.series_type === SeriesType.MOVIE
  )

  return { series, movies }
}

function buildSeries(rawSeries: MALAnimes[]) {
  const series = rawSeries.map(item => {
    return {
      importStatus: 'NOT_STARTED',
      name: item.series_title,
      endDate: formatDate(item.my_finish_date),
      startDate: formatDate(item.my_start_date),
      watchedEpisodes: item.my_watched_episodes ?? null,
      userItemStatus: MALtoDomain(item.my_status),
      __metadata: item,
    } satisfies InsertImportSeries
  })

  return series
}

function buildMovies(rawMovies: MALAnimes[]) {
  const movies = rawMovies.map(item => {
    return {
      importStatus: 'NOT_STARTED',
      name: item.series_title,
      endDate: formatDate(item.my_finish_date),
      userItemStatus: MALtoDomain(item.my_status),
      __metadata: item,
    } as InsertImportMovie
  })

  return movies
}

function formatDate(date: string) {
  if (date === '0000-00-00') {
    return null
  }

  if (!date) {
    return null
  }

  return new Date(date)
}
