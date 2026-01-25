import { DomainError } from './domain-error'

export class InvalidCredentialsError extends DomainError {
  constructor(message?: string) {
    super(message ?? 'Invalid credentials.', 400) // Bad Request
  }
}
