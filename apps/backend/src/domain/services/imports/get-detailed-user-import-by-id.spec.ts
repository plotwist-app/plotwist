import { describe, expect, it } from 'vitest'
import { makeManyRawImportSeries } from '@/test/factories/make-import-series'
import { makeUser } from '@/test/factories/make-user'
import { makeUserImport } from '@/test/factories/make-user-import'
import { getDetailedUserImportById } from './get-detailed-user-import-by-id'

function sortImportResult<
  T extends { series?: { id: string }[]; movies?: { id: string }[] },
>(r: T): T {
  return {
    ...r,
    ...(r.series && {
      series: [...r.series].sort((a, b) => a.id.localeCompare(b.id)),
    }),
    ...(r.movies && {
      movies: [...r.movies].sort((a, b) => a.id.localeCompare(b.id)),
    }),
  }
}

describe('get user import', () => {
  it('should be able to get user import by id', async () => {
    const { id: userId } = await makeUser({})

    const series = makeManyRawImportSeries(4, {})

    const result = await makeUserImport({
      userId,
      series,
    })

    const sut = await getDetailedUserImportById(result.id)

    expect(sortImportResult(sut)).toEqual(sortImportResult(result))
  })

  it('should be able to get user import by id when movies are empty', async () => {
    const { id: userId } = await makeUser({})

    const series = makeManyRawImportSeries(4, {})

    const result = await makeUserImport({
      userId,
      series,
      movies: [],
    })

    const sut = await getDetailedUserImportById(result.id)

    expect(sortImportResult(sut)).toEqual(sortImportResult(result))
  })

  it('should be able to get user import by id when series are empty', async () => {
    const { id: userId } = await makeUser({})

    const result = await makeUserImport({
      userId,
      series: [],
    })

    const sut = await getDetailedUserImportById(result.id)

    expect(sortImportResult(sut)).toEqual(sortImportResult(result))
  })
})
