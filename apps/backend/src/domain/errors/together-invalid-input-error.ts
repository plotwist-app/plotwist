import { DomainError } from './domain-error'

export class TogetherInvalidInputError extends DomainError {
  constructor(message?: string) {
    super(message ?? 'Invalid together room input.', 400)
  }
}
