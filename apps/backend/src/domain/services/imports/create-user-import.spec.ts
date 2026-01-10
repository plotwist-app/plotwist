import { randomUUID } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { UserNotFoundError } from '@/domain/errors/user-not-found'
import { makeManyRawImportMovies } from '@/test/factories/make-import-movies'
import { makeManyRawImportSeries } from '@/test/factories/make-import-series'
import { makeUser } from '@/test/factories/make-user'
import { makeRawUserImport } from '@/test/factories/make-user-import'
import { createUserImport } from './create-user-import'

describe('create user import', () => {
  it('should be able to create an user import with series and movies', async () => {
    const { id: userId } = await makeUser({})

    const movies = makeManyRawImportMovies(5, { importStatus: 'NOT_STARTED' })

    const series = makeManyRawImportSeries(5, { importStatus: 'NOT_STARTED' })

    const rawImport = await makeRawUserImport({
      userId,
      movies,
      series,
    })

    const sut = await createUserImport(rawImport)

    expect(sut).toEqual({
      id: expect.any(String),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      provider: rawImport.provider,
      itemsCount: series.length + movies.length,
      importStatus: 'NOT_STARTED',
      userId: userId,
      series: expect.arrayContaining(
        rawImport.series.map(() =>
          expect.objectContaining({
            importStatus: 'NOT_STARTED',
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          })
        )
      ),
      movies: expect.arrayContaining(
        rawImport.movies.map(() =>
          expect.objectContaining({
            importStatus: 'NOT_STARTED',
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          })
        )
      ),
    })
  })

  it('should be able to insert only import movies', async () => {
    const { id: userId } = await makeUser({})

    const movies = makeManyRawImportMovies(5, { importStatus: 'NOT_STARTED' })

    const rawImport = await makeRawUserImport({
      userId,
      movies,
      series: [],
    })

    const sut = await createUserImport(rawImport)

    expect(sut).toEqual({
      id: expect.any(String),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      userId: userId,
      importStatus: 'NOT_STARTED',
      itemsCount: movies.length,
      provider: rawImport.provider,
      series: [],
      movies: expect.arrayContaining(
        rawImport.movies.map(() =>
          expect.objectContaining({
            importStatus: 'NOT_STARTED',
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          })
        )
      ),
    })
  })

  it('should be able to insert only import series', async () => {
    const { id: userId } = await makeUser({})

    const series = makeManyRawImportSeries(5, { importStatus: 'NOT_STARTED' })

    const rawImport = await makeRawUserImport({
      userId,
      movies: [],
      series,
    })

    const sut = await createUserImport(rawImport)

    expect(sut).toEqual({
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      id: expect.any(String),
      importStatus: 'NOT_STARTED',
      itemsCount: series.length,
      provider: rawImport.provider,
      userId: userId,
      movies: [],
      series: expect.arrayContaining(
        rawImport.series.map(() =>
          expect.objectContaining({
            importStatus: 'NOT_STARTED',
            createdAt: expect.any(Date),
            updatedAt: expect.any(Date),
          })
        )
      ),
    })
  })

  it('should be able to return an error when insert with invalid userId', async () => {
    const fakeUserId = randomUUID()

    const rawImport = await makeRawUserImport({ userId: fakeUserId })

    const sut = await createUserImport(rawImport)

    expect(sut).toBeInstanceOf(UserNotFoundError)
  })
})
