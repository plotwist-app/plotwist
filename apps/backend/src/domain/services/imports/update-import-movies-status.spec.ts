import { describe, expect, it } from 'vitest'

import { makeUser } from '@/test/factories/make-user'

import { makeManyRawImportMovies } from '@/test/factories/make-import-movies'
import { makeUserImport } from '@/test/factories/make-user-import'
import { updateImportMoviesStatus } from './update-import-movies-status'

describe('update import movies status', () => {
  it('should be able to import movie status', async () => {
    const { id: userId } = await makeUser({})

    const movies = makeManyRawImportMovies(2, { importStatus: 'NOT_STARTED' })

    const newStatus = 'COMPLETED'

    const result = await makeUserImport({
      userId,
      movies,
    })

    const sut = await updateImportMoviesStatus(result.movies[0].id, newStatus)

    expect(sut.importStatus).toEqual(newStatus)
  })
})
