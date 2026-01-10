import { DomainError } from './domain-error'

export class EmailOrUsernameAlreadyRegisteredError extends DomainError {
  constructor(message?: string) {
    super(message ?? 'Email or username is already registered.', 409) // Conflict
  }
}
