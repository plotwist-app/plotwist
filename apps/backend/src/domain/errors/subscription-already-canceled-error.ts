import { DomainError } from './domain-error'

export class SubscriptionAlreadyCanceledError extends DomainError {
  constructor() {
    super('Subscription is already canceled', 409)
  }
}
