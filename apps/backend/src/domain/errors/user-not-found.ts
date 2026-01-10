import { DomainError } from './domain-error'

export class UserNotFoundError extends DomainError {
  constructor(message?: string) {
    super(message ?? 'User not found.', 404) // Not found
  }
}
