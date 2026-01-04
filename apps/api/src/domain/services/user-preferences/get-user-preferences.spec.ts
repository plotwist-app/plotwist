import { makeUser } from '@/test/factories/make-user'
import { describe, expect, it } from 'vitest'
import { getUserPreferencesService } from './get-user-preferences'
import { updateUserPreferencesService } from './update-user-preferences'

describe('get user preferences service', () => {
  it('should be able to get user preferences', async () => {
    const user = await makeUser()
    const watchProvidersIds = [1, 2, 3]

    await updateUserPreferencesService({
      userId: user.id,
      watchProvidersIds,
      watchRegion: 'US',
    })

    const sut = await getUserPreferencesService({
      userId: user.id,
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

  it('should be able to return null when user has no preferences', async () => {
    const user = await makeUser()
    const sut = await getUserPreferencesService({
      userId: user.id,
    })

    expect(sut).toEqual({
      userPreferences: null,
    })
  })
})
