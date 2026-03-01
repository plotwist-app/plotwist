import { randomUUID } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { makeUser } from '@/test/factories/make-user'
import { UserNotFoundError } from '../../errors/user-not-found'
import { completeSubscription } from '../subscriptions/complete-subscription'
import { getUserById } from './get-by-id'

describe('get user by id', () => {
  it('should be able to get an user by id', async () => {
    const { id } = await makeUser()

    const sut = await getUserById(id)

    expect(sut).toBeTruthy()
  })

  it('should be able to fail when user id does not exists', async () => {
    const randomId = randomUUID()

    const sut = await getUserById(randomId)

    expect(sut).toBeInstanceOf(UserNotFoundError)
  })

  it('should be able to get and return user with subscription type', async () => {
    const { id, email } = await makeUser()

    const user = await getUserById(id)

    if (user instanceof UserNotFoundError) {
      throw new Error('User not found')
    }

    expect(user.user.subscriptionType).toBe('MEMBER')

    await completeSubscription({
      email,
      provider: 'STRIPE',
      providerSubscriptionId: randomUUID(),
      type: 'PRO',
    })

    const sut = await getUserById(id)

    if (sut instanceof UserNotFoundError) {
      throw new Error('User not found')
    }

    expect(sut.user.subscriptionType).toBe('PRO')
  })
})
