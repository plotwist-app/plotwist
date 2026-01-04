import { DomainError } from './domain-error'

export class ReviewReplyNotFoundError extends DomainError {
  constructor(message?: string) {
    super(message ?? 'Review reply not found.', 404) // Not Found
  }
}
