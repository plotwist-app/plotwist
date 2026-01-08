import { DomainError } from './domain-error'

export class ListItemNotFoundError extends DomainError {
  constructor(message?: string) {
    super(message ?? 'List item not found.', 404) // Not found
  }
}
