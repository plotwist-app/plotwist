import { DomainError } from './domain-error'

export class NoValidFieldsError extends DomainError {
  constructor(message?: string) {
    super(message ?? 'No valid fields provided for update.', 400)
  }
}
