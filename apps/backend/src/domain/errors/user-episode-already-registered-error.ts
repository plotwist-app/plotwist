import { DomainError } from './domain-error'

export class UserEpisodeAlreadyRegisteredError extends DomainError {
  constructor(message?: string) {
    super(message ?? 'User episode already registered.', 409) // Not found
  }
}
