import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { selectReviews } from '@/db/repositories/reviews-repository'
import type { getReviewsQuerySchema } from '@/http/schemas/reviews'

export type GetReviewsServiceInput = Omit<
  typeof getReviewsQuerySchema._type,
  'tmdbId' | 'language' | 'limit' | 'seasonNumber' | 'episodeNumber'
> & {
  tmdbId?: number
  authenticatedUserId?: string
  limit?: number

  startDate?: Date
  endDate?: Date
  seasonNumber?: number
  episodeNumber?: number
}

function getIntervalDate(interval: GetReviewsServiceInput['interval']) {
  const now = new Date()

  switch (interval) {
    case 'TODAY':
      return {
        startDate: startOfDay(now),
        endDate: endOfDay(now),
      }
    case 'THIS_WEEK':
      return {
        startDate: startOfWeek(now),
        endDate: endOfWeek(now),
      }
    case 'THIS_MONTH':
      return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now),
      }
    case 'ALL_TIME':
      return {
        startDate: undefined,
        endDate: undefined,
      }
    default:
      throw new Error(`Invalid interval: ${interval}`)
  }
}

export async function getReviewsService(input: GetReviewsServiceInput) {
  const { startDate, endDate } = getIntervalDate(input.interval)
  const reviews = await selectReviews({ ...input, startDate, endDate })

  return { reviews }
}
