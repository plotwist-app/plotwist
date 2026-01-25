import { DomainError } from './domain-error'

export class AlreadyHaveActiveSubscriptionError extends DomainError {
  constructor() {
    super('Already have an active subscription', 400)
  }
}
