import { DomainError } from './domain-error'

export class TogetherUnauthorizedError extends DomainError {
  constructor(message?: string) {
    super(message ?? 'Together participant token is invalid.', 401)
  }
}
