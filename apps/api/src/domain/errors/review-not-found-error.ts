import { DomainError } from './domain-error'

export class ReviewNotFoundError extends DomainError {
  constructor(message?: string) {
    super(message ?? 'Review not found.', 404) // Not found
  }
}
