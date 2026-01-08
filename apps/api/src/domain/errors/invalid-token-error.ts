import { DomainError } from './domain-error'

export class InvalidTokenError extends DomainError {
  constructor(message?: string) {
    super(message ?? 'Invalid token error.', 401) // Unauthorized
  }
}
