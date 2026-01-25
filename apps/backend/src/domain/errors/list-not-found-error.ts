import { DomainError } from './domain-error'

export class ListNotFoundError extends DomainError {
  constructor(message?: string) {
    super(message ?? 'List not found.', 404) // Not found
  }
}
