import { describe, expect, it } from 'vitest'
import { makeUser } from '@/test/factories/make-user'
import { updateUserPreferencesService } from './update-user-preferences'

describe('update user preferences service', () => {
  it('should be able to update user preferences', async () => {
    const user = await makeUser()
    const watchProvidersIds = [1, 2, 3]

    const sut = await updateUserPreferencesService({
      userId: user.id,
      watchProvidersIds,
      watchRegion: 'US',
    })

    expect(sut).toEqual({
      userPreferences: expect.objectContaining({
        id: expect.any(String),
        userId: user.id,
        watchProvidersIds,
        watchRegion: 'US',
      }),
    })
  })
})
