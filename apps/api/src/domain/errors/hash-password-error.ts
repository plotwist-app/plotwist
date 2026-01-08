import { DomainError } from './domain-error'

export class HashPasswordError extends DomainError {
  constructor(message?: string) {
    super(message ?? 'Fail to hash password.', 500) //  Internal Server Error
  }
}
