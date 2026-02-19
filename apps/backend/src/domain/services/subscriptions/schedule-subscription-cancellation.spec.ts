import { getSubscriptionById } from '@/db/repositories/subscription-repository'
import { stripe } from '@/infra/adapters/stripe'
import { makeSubscription } from '@/test/factories/make-subscription'
import { makeUser } from '@/test/factories/make-user'
import { scheduleCancellation } from './schedule-subscription-cancellation'

vi.mock('@/adapters/stripe', () => ({
  stripe: {
    subscriptions: {
      update: vi.fn().mockResolvedValue({
        id: 'sub_123',
        cancel_at_period_end: true,
        status: 'active',
      }),
    },
  },
}))

describe('scheduleSubscriptionCancellation', () => {
  it('should schedule subscription cancellation', async () => {
    const user = await makeUser()
    const subscription = await makeSubscription({ userId: user.id })

    const scheduledCancellation = await scheduleCancellation(
      subscription,
      10,
      'test'
    )
    expect(stripe.subscriptions.update).toHaveBeenCalled()
    expect(stripe.subscriptions.update).toHaveBeenCalledWith(subscription.id, {
      cancel_at_period_end: true,
      cancel_at: expect.any(Number),
    })

    expect(scheduledCancellation.status).toBe('PENDING_CANCELLATION')

    const subscriptionFromDb = await getSubscriptionById(subscription.id)
    expect(subscriptionFromDb?.status).toBe('PENDING_CANCELLATION')
  })

  it('should be able cancel after the payment day', async () => {
    const paymentDay = 10

    const user = await makeUser()

    const subscription = await makeSubscription({ userId: user.id })

    const fakeToday = new Date('2025-04-07T00:00:00.000Z')

    vi.setSystemTime(fakeToday)

    const scheduledCancellation = await scheduleCancellation(
      subscription,
      paymentDay,
      'test'
    )

    expect(stripe.subscriptions.update).toHaveBeenCalled()
    expect(stripe.subscriptions.update).toHaveBeenCalledWith(subscription.id, {
      cancel_at_period_end: true,
      cancel_at: expect.any(Number),
    })

    expect(scheduledCancellation.status).toBe('PENDING_CANCELLATION')

    const subscriptionFromDb = await getSubscriptionById(subscription.id)

    expect(subscriptionFromDb?.status).toBe('PENDING_CANCELLATION')
    expect(subscriptionFromDb?.canceledAt).toEqual(new Date(2025, 3, 9))
  })

  it('should be able cancel before the payment day', async () => {
    const paymentDay = 10

    const user = await makeUser()

    const subscription = await makeSubscription({ userId: user.id })

    const fakeToday = new Date('2025-04-11T00:00:00.000Z')

    vi.setSystemTime(fakeToday)

    const scheduledCancellation = await scheduleCancellation(
      subscription,
      paymentDay,
      'test'
    )

    expect(stripe.subscriptions.update).toHaveBeenCalled()
    expect(stripe.subscriptions.update).toHaveBeenCalledWith(subscription.id, {
      cancel_at_period_end: true,
      cancel_at: expect.any(Number),
    })

    expect(scheduledCancellation.status).toBe('PENDING_CANCELLATION')

    const subscriptionFromDb = await getSubscriptionById(subscription.id)

    expect(subscriptionFromDb?.status).toBe('PENDING_CANCELLATION')
    expect(subscriptionFromDb?.canceledAt).toEqual(new Date(2025, 4, 9))
  })
})
