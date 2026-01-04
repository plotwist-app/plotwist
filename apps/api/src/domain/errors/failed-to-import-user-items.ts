import { DomainError } from './domain-error'

export class FailedToInsertUserImport extends DomainError {
  constructor(message?: string) {
    super(message ?? 'Failed to insert user import', 422)
  }
}
