import { describe, expect, it } from 'vitest'

import { makeUserImport } from '@/test/factories/make-user-import'
import { getImportMovieById } from './get-import-movie-by-id'

describe('get import movie by id', () => {
  it('should be able to get import movie by id', async () => {
    const userImport = await makeUserImport({})

    const ids = userImport.movies.map(movie => movie.id)

    const sut = await getImportMovieById(ids[0])

    expect(sut.id).toEqual(ids[0])
  })
})
