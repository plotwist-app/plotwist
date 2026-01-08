import { describe, expect, it } from 'vitest'

import { makeUserImport } from '@/test/factories/make-user-import'
import { getUserImportById } from './get-user-import-by-id'

describe('get user import by id', () => {
  it('should be able to get user import by id', async () => {
    const userImport = await makeUserImport({})

    const sut = await getUserImportById(userImport.id)

    expect(sut.id).toEqual(userImport.id)
  })
})
