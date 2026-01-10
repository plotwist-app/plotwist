import { DomainError } from './domain-error'

export class FollowAlreadyRegisteredError extends DomainError {
  constructor(message?: string) {
    super(message ?? 'Follow already registered', 409) // Conflict
  }
}
