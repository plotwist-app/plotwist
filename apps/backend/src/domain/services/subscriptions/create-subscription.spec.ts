import { faker } from '@faker-js/faker'
import { describe, expect, it } from 'vitest'
import { AlreadyHaveActiveSubscriptionError } from '@/domain/errors/already-have-active-subscription'
import { UserNotFoundError } from '@/domain/errors/user-not-found'
import { makeSubscription } from '@/test/factories/make-subscription'
import { makeUser } from '@/test/factories/make-user'
import { createSubscription } from './create-subscription'

describe('create subscription', () => {
  it('should be able to create subscription', async () => {
    const user = await makeUser()
    const sut = await createSubscription({ type: 'PRO', userId: user.id })

    expect(sut).toEqual({
      subscription: expect.objectContaining({
        userId: user.id,
      }),
    })
  })

  it('should not be able to generate a new subscription if user already has one', async () => {
    const user = await makeUser()
    await makeSubscription({ userId: user.id })

    const sut = await createSubscription({ type: 'PRO', userId: user.id })

    expect(sut).toBeInstanceOf(AlreadyHaveActiveSubscriptionError)
  })

  it('should not be able to create subscription with invalid user id', async () => {
    const sut = await createSubscription({
      type: 'PRO',
      userId: faker.string.uuid(),
    })

    expect(sut).toBeInstanceOf(UserNotFoundError)
  })
})
