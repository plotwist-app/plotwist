import type { InsertSubscriptionModel } from '@/domain/entities/subscription'
import { AlreadyHaveActiveSubscriptionError } from '@/domain/errors/already-have-active-subscription'
import { UserNotFoundError } from '@/domain/errors/user-not-found'
import { getUserById } from '@/domain/services/users/get-by-id'
import {
  getActiveSubscriptionByUserId,
  insertSubscription,
} from '@/infra/db/repositories/subscription-repository'

export async function createSubscription(params: InsertSubscriptionModel) {
  const user = await getUserById(params.userId)

  if (user instanceof UserNotFoundError) {
    return user
  }

  const userSubscription = await getActiveSubscriptionByUserId(params.userId)

  if (userSubscription) {
    return new AlreadyHaveActiveSubscriptionError()
  }

  const [subscription] = await insertSubscription(params)

  return { subscription }
}
