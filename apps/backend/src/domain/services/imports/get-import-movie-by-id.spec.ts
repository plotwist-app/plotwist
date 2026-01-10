import { describe, expect, it } from 'vitest'

import { makeUserImport } from '@/test/factories/make-user-import'
import { getImportSeriesById } from './get-import-series-by-id'

describe('get import series by id', () => {
  it('should be able to get import series by id', async () => {
    const userImport = await makeUserImport({})

    const ids = userImport.series.map(series => series.id)

    const sut = await getImportSeriesById(ids[0])

    expect(sut.id).toEqual(ids[0])
  })
})
