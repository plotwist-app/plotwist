import { faker } from '@faker-js/faker'
import { describe, expect, it } from 'vitest'
import { cancelUserSubscription } from '@/db/repositories/subscription-repository'
import { DomainError } from '@/domain/errors/domain-error'
import { makeUser } from '@/test/factories/make-user'
import { createSubscription } from './create-subscription'
import {
  getLastestActiveSubscription,
  getSubscription,
} from './get-subscription'

describe('get subscription', () => {
  it('should be able to get subscription', async () => {
    const user = await makeUser()
    const subscription = await createSubscription({
      type: 'PRO',
      userId: user.id,
    })

    expect(subscription).toEqual({
      subscription: expect.objectContaining({
        userId: user.id,
        status: 'ACTIVE',
        createdAt: expect.any(Date),
        canceledAt: null,
        cancellationReason: null,
      }),
    })
  })

  it('should not be able to get subscription with invalid user id', async () => {
    const subscription = await getSubscription(faker.string.uuid())

    expect(subscription).toBeInstanceOf(DomainError)
  })
})

describe('get lastest active subscription', () => {
  it('should be able to get lastest active subscription', async () => {
    const user = await makeUser()
    await createSubscription({
      type: 'PRO',
      userId: user.id,
    })

    const lastestActiveSubscription = await getLastestActiveSubscription(
      user.id
    )

    expect(lastestActiveSubscription).toMatchObject({
      userId: user.id,
      status: 'ACTIVE',
      createdAt: expect.any(Date),
      canceledAt: null,
      cancellationReason: null,
    })
  })

  it('should be able to get lastest active subscription with pending cancellation', async () => {
    const user = await makeUser()
    await createSubscription({
      type: 'PRO',
      userId: user.id,
      status: 'PENDING_CANCELLATION',
      canceledAt: new Date(),
      cancellationReason: 'test',
    })

    const lastestActiveSubscription = await getLastestActiveSubscription(
      user.id
    )

    expect(lastestActiveSubscription).not.toBeNull()
    expect(lastestActiveSubscription).toMatchObject({
      status: 'PENDING_CANCELLATION',
    })
  })

  it('should not be able to get lastest active subscription with invalid user id', async () => {
    const lastestActiveSubscription = await getLastestActiveSubscription(
      faker.string.uuid()
    )

    expect(lastestActiveSubscription).toBeNull()
  })

  it('should not be able to get lastest active subscription if no active subscription', async () => {
    const user = await makeUser()
    await createSubscription({
      type: 'PRO',
      userId: user.id,
    })

    const subscription = await getLastestActiveSubscription(user.id)

    if (!subscription) {
      throw new Error('Subscription not found')
    }

    await cancelUserSubscription({
      id: subscription.id,
      userId: user.id,
      status: 'CANCELED',
      canceledAt: new Date(),
      cancellationReason: 'test',
    })

    const lastestActiveSubscription = await getLastestActiveSubscription(
      user.id
    )

    expect(lastestActiveSubscription).toBeNull()
  })

  it('should not be able to get lastest active subscription if no subscription', async () => {
    const lastestActiveSubscription = await getLastestActiveSubscription(
      faker.string.uuid()
    )

    expect(lastestActiveSubscription).toBeNull()
  })
})
