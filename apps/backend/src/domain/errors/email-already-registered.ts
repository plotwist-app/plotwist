import { DomainError } from './domain-error'

export class EmailAlreadyRegisteredError extends DomainError {
  constructor(message?: string) {
    super(message ?? 'Email is already registered.', 409) // Conflict
  }
}
