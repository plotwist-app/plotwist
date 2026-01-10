import { randomUUID } from 'node:crypto'
import { type ExtractTablesWithRelations, eq, sql } from 'drizzle-orm'
import type { PgTransaction } from 'drizzle-orm/pg-core'
import type { PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js'
import type { InsertUserImportWithItems } from '@/domain/entities/import'
import type { InsertImportMovie } from '@/domain/entities/import-movies'
import type { InsertImportSeries } from '@/domain/entities/import-series'
import { CannotInsertIntoImportTableError } from '@/domain/errors/cannot-insert-into-import-table'
import { db } from '..'
import { schema } from '../schema'

type TrxType = PgTransaction<
  PostgresJsQueryResultHKT,
  typeof import('../schema'),
  ExtractTablesWithRelations<typeof import('../schema')>
>

export async function insertUserImport({
  userId,
  itemsCount,
  provider,
  movies,
  series,
}: InsertUserImportWithItems) {
  const transaction = await db.transaction(async trx => {
    const [userImport] = await trx
      .insert(schema.userImports)
      .values({
        userId,
        itemsCount,
        provider,
        importStatus: 'NOT_STARTED',
      })
      .returning()

    const importId = userImport.id

    const savedMovies = await saveMovies(movies, importId, trx)

    const savedSeries = await saveSeries(series, importId, trx)

    return { ...userImport, series: savedSeries, movies: savedMovies }
  })

  return transaction
}

async function saveMovies(
  movies: InsertImportMovie[],
  importId: string,
  trx: TrxType
) {
  try {
    if (movies.length > 0) {
      const parsedMovies = movies.map(item => ({
        id: randomUUID(),
        importId: importId,
        name: item.name,
        endDate: item.endDate,
        userItemStatus: item.userItemStatus,
        importStatus: item.importStatus,
        tmdbId: item.tmdbId,
        __metadata: item.__metadata,
      }))

      const result = await trx
        .insert(schema.importMovies)
        .values(parsedMovies)
        .returning()

      return result
    }

    return []
  } catch (error) {
    throw new CannotInsertIntoImportTableError(
      `Error saving series: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

async function saveSeries(
  series: InsertImportSeries[],
  importId: string,
  trx: TrxType
) {
  try {
    if (series.length > 0) {
      const parsedSeries = series.map(item => ({
        id: randomUUID(),
        importId: importId,
        name: item.name,
        startDate: item.startDate,
        endDate: item.endDate,
        userItemStatus: item.userItemStatus,
        importStatus: item.importStatus,
        tmdbId: item.tmdbId,
        watchedEpisodes: item.watchedEpisodes,
        seriesEpisodes: item.seriesEpisodes,
        __metadata: item.__metadata,
      }))

      return await trx
        .insert(schema.importSeries)
        .values(parsedSeries)
        .returning()
    }

    return []
  } catch (error) {
    throw new CannotInsertIntoImportTableError(
      `Error saving series: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

export async function getDetailedUserImport(id: string) {
  const userImport = await getUserImport(id)

  const movies = await db
    .select()
    .from(schema.importMovies)
    .where(eq(schema.importMovies.importId, id))

  const series = await db
    .select()
    .from(schema.importSeries)
    .where(eq(schema.importSeries.importId, id))

  return { ...userImport, series, movies }
}

export async function checkAndFinalizeImport(importId: string) {
  await db.transaction(async trx => {
    const [moviesStatusCheck] = await trx.execute(sql`
      SELECT COUNT(*) AS incomplete_movies
      FROM ${schema.importMovies}
      WHERE ${schema.importMovies.importId} = ${importId}
        AND ${schema.importMovies.importStatus} NOT IN ('COMPLETED', 'FAILED')
    `)

    const [seriesStatusCheck] = await trx.execute(sql`
      SELECT COUNT(*) AS incomplete_series
      FROM ${schema.importSeries}
      WHERE ${schema.importSeries.importId} = ${importId}
        AND ${schema.importSeries.importStatus} NOT IN ('COMPLETED', 'FAILED')
    `)

    const incompleteMovies = moviesStatusCheck.incomplete_movies
    const incompleteSeries = seriesStatusCheck.incomplete_series

    if (incompleteMovies === 0 && incompleteSeries === 0) {
      await trx
        .update(schema.userImports)
        .set({
          importStatus: 'COMPLETED',
          updatedAt: new Date(),
        })
        .where(eq(schema.userImports.id, importId))
    }
  })
}

export async function getUserImport(id: string) {
  const [userImport] = await db
    .select()
    .from(schema.userImports)
    .where(eq(schema.userImports.id, id))

  return userImport
}
