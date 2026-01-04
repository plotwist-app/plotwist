import { DomainError } from './domain-error'

export class CannotInsertIntoImportTableError extends DomainError {
  constructor(message?: string) {
    super(message ?? 'Cannot insert into import tables', 422) //  Unprocessable Entity
  }
}
