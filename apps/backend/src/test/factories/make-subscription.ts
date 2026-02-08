import { faker } from '@faker-js/faker'
import { insertSubscription } from '@/db/repositories/subscription-repository'
import type {
  InsertSubscriptionModel,
  Subscription,
} from '@/domain/entities/subscription'

type Overrides = Partial<InsertSubscriptionModel>

export function makeRawSubscription(
  overrides: Overrides = {}
): InsertSubscriptionModel {
  return {
    type: 'MEMBER',
    userId: faker.string.uuid(),
    status: 'ACTIVE',
    provider: 'STRIPE',
    ...overrides,
  }
}

export async function makeSubscription(
  overrides: Overrides = {}
): Promise<Subscription> {
  const [subscription] = await insertSubscription(
    makeRawSubscription(overrides)
  )

  return subscription
}
