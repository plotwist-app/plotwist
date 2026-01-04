import { DomainError } from './domain-error'

export class CannotUnzipFileError extends DomainError {
  constructor(message?: string) {
    super(message ?? 'Cannot unzip the file', 422) //  Unprocessable Entity
  }
}
