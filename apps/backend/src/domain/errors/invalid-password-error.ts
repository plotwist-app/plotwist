import { DomainError } from './domain-error'

export class InvalidPasswordError extends DomainError {
  constructor(message?: string) {
    super(message ?? 'Invalid password.', 400) // Bad Request
  }
}
