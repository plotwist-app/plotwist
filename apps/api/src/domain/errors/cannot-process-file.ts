import { DomainError } from './domain-error'

export class CannotProcessImportFileError extends DomainError {
  constructor(message?: string) {
    super(message ?? 'Cannot process import file', 422) //  Unprocessable Entity
  }
}
