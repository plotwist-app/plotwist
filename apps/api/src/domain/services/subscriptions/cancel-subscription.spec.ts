import { makeUser } from '@/test/factories/make-user'
import { cancelSubscription } from './cancel-subscription'
import { makeSubscription } from '@/test/factories/make-subscription'
import { faker } from '@faker-js/faker'
import { describe, expect, it, type Mock } from 'vitest'
import { stripe } from '@/adapters/stripe'
import { getSubscriptionById } from '@/db/repositories/subscription-repository'
import { getUserById } from '@/db/repositories/user-repository'

vi.mock('@/adapters/stripe', () => ({
  stripe: {
    subscriptions: {
      cancel: vi.fn(),
    },
  },
}))

describe('Cancel subscription', () => {
  it('should cancel the subscription', async () => {
    const user = await makeUser()

    const subscription = await makeSubscription({
      userId: user.id,
    })

    expect(subscription).toMatchObject({
      id: subscription.id,
      status: 'ACTIVE',
      cancellationReason: null,
      canceledAt: null,
    })

    const mockStripeResponse = {
      id: subscription.id,
      status: 'canceled',
    }
    ;(stripe.subscriptions.cancel as Mock).mockResolvedValue(mockStripeResponse)

    const reason = faker.lorem.sentence(5)

    await cancelSubscription(subscription, reason)

    expect(stripe.subscriptions.cancel).toHaveBeenCalledWith(subscription.id)

    const updatedSubscription = await getSubscriptionById(subscription.id)

    expect(updatedSubscription).toMatchObject({
      id: subscription.id,
      status: 'CANCELED',
      cancellationReason: reason,
      canceledAt: expect.any(Date),
    })
  })

  it('should update user subscription status after cancel', async () => {
    const user = await makeUser()

    const subscription = await makeSubscription({
      userId: user.id,
    })

    const mockStripeResponse = {
      id: subscription.id,
      status: 'canceled',
    }
    ;(stripe.subscriptions.cancel as Mock).mockResolvedValue(mockStripeResponse)

    const reason = faker.lorem.sentence(5)

    await cancelSubscription(subscription, reason)

    expect(stripe.subscriptions.cancel).toHaveBeenCalledWith(subscription.id)

    await getSubscriptionById(subscription.id)

    const [updatedUser] = await getUserById(user.id)

    expect(updatedUser).toMatchObject({
      subscriptionType: 'MEMBER',
    })
  })
})
