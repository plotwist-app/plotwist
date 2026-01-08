import type { UserItemStatus } from '@/@types/item-status-enum'
import { MALStatus } from '@/@types/my-anime-list-import'

// My anime list to domain
export function MALtoDomain(status: MALStatus): UserItemStatus {
  switch (status) {
    case MALStatus.COMPLETED:
      return 'WATCHED'
    case MALStatus.DROPPED:
      return 'DROPPED'
    case MALStatus.PLAN_TO_WATCH:
      return 'WATCHLIST'
    case MALStatus.WATCHING:
      return 'WATCHING'
    case MALStatus.ON_HOLD:
      return 'WATCHLIST'

    default:
      throw new Error(`Unhandled status: ${status}`)
  }
}
