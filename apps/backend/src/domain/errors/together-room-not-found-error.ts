import { DomainError } from './domain-error'

export class TogetherRoomNotFoundError extends DomainError {
  constructor(message?: string) {
    super(message ?? 'Together room not found.', 404)
  }
}
