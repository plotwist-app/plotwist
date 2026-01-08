import { describe, expect, it } from 'vitest'

import { makeUser } from '@/test/factories/make-user'
import { completeSubscription } from './complete-subscription'
import { UserNotFoundError } from '@/domain/errors/user-not-found'

describe('complete subscription', () => {
  it('should be able to complete subscription', async () => {
    const user = await makeUser()
    const sut = await completeSubscription(user.email)

    expect(sut).toEqual({
      subscription: expect.objectContaining({
        userId: user.id,
      }),
    })
  })

  it('should not be able to complete subscription with user not found', async () => {
    const sut = await completeSubscription('not-found@example.com')

    expect(sut).toBeInstanceOf(UserNotFoundError)
  })
})
