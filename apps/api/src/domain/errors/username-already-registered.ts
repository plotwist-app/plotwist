import { DomainError } from './domain-error'

export class UsernameAlreadyRegisteredError extends DomainError {
  constructor(message?: string) {
    super(message ?? 'Username is already registered.', 409) // Conflict
  }
}
