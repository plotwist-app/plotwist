import { randomUUID } from 'node:crypto'
import { getSubscriptionById } from '@/db/repositories/subscription-repository'
import type { SubscriptionProvider } from '@/ports/subscription-provider'
import { makeSubscription } from '@/test/factories/make-subscription'
import { makeUser } from '@/test/factories/make-user'
import { scheduleCancellation } from './schedule-subscription-cancellation'

function uniqueProviderSubId() {
  return `sub_${randomUUID().replace(/-/g, '')}`
}

function mockSubscriptionProvider(periodEnd?: Date): SubscriptionProvider {
  return {
    getCurrentPeriodEnd: vi
      .fn()
      .mockResolvedValue(periodEnd ?? new Date(Date.now() + 86400 * 30 * 1000)),
    scheduleCancelAtPeriodEnd: vi.fn().mockResolvedValue(undefined),
    cancelImmediately: vi.fn(),
  }
}

describe('scheduleSubscriptionCancellation', () => {
  it('should schedule subscription cancellation at period end', async () => {
    const providerSubId = uniqueProviderSubId()
    const user = await makeUser()
    const provider = mockSubscriptionProvider()

    const subscription = await makeSubscription({
      userId: user.id,
      providerSubscriptionId: providerSubId,
    })

    const scheduledCancellation = await scheduleCancellation(
      subscription,
      'test',
      provider
    )

    expect(provider.getCurrentPeriodEnd).toHaveBeenCalledWith(providerSubId)
    expect(provider.scheduleCancelAtPeriodEnd).toHaveBeenCalledWith(
      providerSubId,
      expect.any(Date)
    )

    expect(scheduledCancellation.status).toBe('PENDING_CANCELLATION')

    const subscriptionFromDb = await getSubscriptionById(subscription.id)
    expect(subscriptionFromDb?.status).toBe('PENDING_CANCELLATION')
  })

  it('should set canceledAt from provider getCurrentPeriodEnd', async () => {
    const providerSubId = uniqueProviderSubId()
    const periodEnd = new Date('2025-04-09T23:59:59.000Z')
    const provider = mockSubscriptionProvider(periodEnd)

    const user = await makeUser()
    const subscription = await makeSubscription({
      userId: user.id,
      providerSubscriptionId: providerSubId,
    })

    const scheduledCancellation = await scheduleCancellation(
      subscription,
      'test',
      provider
    )

    expect(scheduledCancellation.status).toBe('PENDING_CANCELLATION')
    expect(scheduledCancellation.canceledAt).toEqual(periodEnd)

    const subscriptionFromDb = await getSubscriptionById(subscription.id)
    expect(subscriptionFromDb?.canceledAt).toEqual(periodEnd)
  })

  it('should throw when subscription has no provider subscription id', async () => {
    const user = await makeUser()
    const provider = mockSubscriptionProvider()

    const subscription = await makeSubscription({
      userId: user.id,
      providerSubscriptionId: null,
    })

    await expect(
      scheduleCancellation(subscription, 'test', provider)
    ).rejects.toThrow(
      'Cannot schedule cancellation: subscription has no provider subscription id'
    )

    expect(provider.getCurrentPeriodEnd).not.toHaveBeenCalled()
    expect(provider.scheduleCancelAtPeriodEnd).not.toHaveBeenCalled()
  })
})
