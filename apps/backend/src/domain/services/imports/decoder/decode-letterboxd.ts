import type { MultipartFile } from '@fastify/multipart'
import type { UserItemStatus } from '@/@types/item-status-enum'
import type { WatchedRecord } from '@/@types/letterboxd'
import type {
  DetailedUserImport,
  InsertUserImportWithItems,
} from '@/domain/entities/import'
import type { InsertImportMovie } from '@/domain/entities/import-movies'
import { DomainError } from '@/domain/errors/domain-error'
import { processAndConvertZipFile } from '@/domain/helpers/csv-to-json'
import { createUserImport } from '../create-user-import'

export async function decodeLetterboxd(
  userId: string,
  uploadedFile: MultipartFile
): Promise<DetailedUserImport | DomainError> {
  try {
    const unzippedContent = await processAndConvertZipFile(uploadedFile)

    const rawMovies = unzippedContent.get('watched.csv') || []

    const toFormatMovies = validateWatchedRecords(rawMovies)
    const movies = buildMovies(toFormatMovies, 'WATCHED')

    const userImport: InsertUserImportWithItems = {
      itemsCount: movies.length,
      provider: 'LETTERBOXD',
      userId,
      importStatus: 'NOT_STARTED',
      movies,
      series: [],
    }

    return await createUserImport(userImport)
  } catch (error) {
    if (error instanceof DomainError) {
      return error
    }

    return new DomainError('An unexpected error occurred', 500)
  }
}

function validateWatchedRecords(
  rawRecords: Record<string, string>[]
): WatchedRecord[] {
  return rawRecords.map(record => {
    if (
      'Date' in record &&
      'Name' in record &&
      'Year' in record &&
      'Letterboxd URI' in record
    ) {
      return {
        Date: record.Date,
        Name: record.Name,
        Year: record.Year,
        'Letterboxd URI': record['Letterboxd URI'],
      }
    }
    throw new DomainError('Invalid CSV structure in watched.csv', 400)
  })
}

function buildMovies(rawMovies: WatchedRecord[], status: UserItemStatus) {
  const movies: InsertImportMovie[] = rawMovies.map(item => {
    return {
      importStatus: 'NOT_STARTED',
      name: item.Name,
      endDate: formatDate(item.Date),
      userItemStatus: status,
      __metadata: item,
    }
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
