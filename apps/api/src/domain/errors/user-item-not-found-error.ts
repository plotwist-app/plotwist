import { DomainError } from './domain-error'

export class UserItemNotFoundError extends DomainError {
  constructor(message?: string) {
    super(message ?? 'User item not found.', 404) // Not found
  }
}
