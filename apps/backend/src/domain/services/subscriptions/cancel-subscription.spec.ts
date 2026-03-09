import { randomUUID } from 'node:crypto'
import { faker } from '@faker-js/faker'
import { describe, expect, it } from 'vitest'
import { SubscriptionAlreadyCanceledError } from '@/domain/errors/subscription-already-canceled-error'
import { getSubscriptionById } from '@/infra/db/repositories/subscription-repository'
import { getUserById } from '@/infra/db/repositories/user-repository'
import type { SubscriptionProvider } from '@/infra/ports/subscription-provider'
import { makeSubscription } from '@/test/factories/make-subscription'
import { makeUser } from '@/test/factories/make-user'
import { cancelSubscription } from './cancel-subscription'

function uniqueProviderSubId() {
  return `sub_${randomUUID().replace(/-/g, '')}`
}

function mockSubscriptionProvider(): SubscriptionProvider {
  return {
    scheduleCancelAtPeriodEnd: vi.fn().mockResolvedValue(new Date()),
    cancelImmediately: vi.fn().mockResolvedValue(undefined),
  }
}
vi.mock('@/infra/adapters/stripe', () => ({
  stripe: {
    subscriptions: {
      cancel: vi.fn(),
    },
  },
}))

describe('Cancel subscription', () => {
  it('should cancel the subscription', async () => {
    const providerSubId = uniqueProviderSubId()
    const user = await makeUser()
    const provider = mockSubscriptionProvider()

    const subscription = await makeSubscription({
      userId: user.id,
      providerSubscriptionId: providerSubId,
    })

    expect(subscription).toMatchObject({
      id: subscription.id,
      status: 'ACTIVE',
      cancellationReason: null,
      canceledAt: null,
    })

    const reason = faker.lorem.sentence(5)

    await cancelSubscription(subscription, reason, provider)

    expect(provider.cancelImmediately).toHaveBeenCalledWith(providerSubId)

    const updatedSubscription = await getSubscriptionById(subscription.id)

    expect(updatedSubscription).toMatchObject({
      id: subscription.id,
      status: 'CANCELED',
      cancellationReason: reason,
      canceledAt: expect.any(Date),
    })
  })

  it('should update user subscription status after cancel', async () => {
    const providerSubId = uniqueProviderSubId()
    const user = await makeUser()
    const provider = mockSubscriptionProvider()

    const subscription = await makeSubscription({
      userId: user.id,
      providerSubscriptionId: providerSubId,
    })

    const reason = faker.lorem.sentence(5)

    await cancelSubscription(subscription, reason, provider)

    expect(provider.cancelImmediately).toHaveBeenCalledWith(providerSubId)

    await getSubscriptionById(subscription.id)

    const [updatedUser] = await getUserById(user.id)

    expect(updatedUser).toMatchObject({
      subscriptionType: 'MEMBER',
    })
  })

  it('should throw when subscription has no provider subscription id', async () => {
    const user = await makeUser()
    const provider = mockSubscriptionProvider()

    const subscription = await makeSubscription({
      userId: user.id,
      providerSubscriptionId: null,
    })

    await expect(
      cancelSubscription(subscription, 'reason', provider)
    ).rejects.toThrow(
      'Cannot cancel: subscription has no provider subscription id'
    )

    expect(provider.cancelImmediately).not.toHaveBeenCalled()
  })

  it('should still update DB when provider says subscription already canceled (idempotent)', async () => {
    const providerSubId = uniqueProviderSubId()
    const user = await makeUser()
    const provider = mockSubscriptionProvider()
    vi.mocked(provider.cancelImmediately).mockRejectedValueOnce(
      new SubscriptionAlreadyCanceledError()
    )

    const subscription = await makeSubscription({
      userId: user.id,
      providerSubscriptionId: providerSubId,
    })

    const result = await cancelSubscription(subscription, 'reason', provider)

    expect(result).toEqual({ id: subscription.id })
    const updated = await getSubscriptionById(subscription.id)
    expect(updated?.status).toBe('CANCELED')
  })
})
