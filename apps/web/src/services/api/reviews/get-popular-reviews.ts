import { supabase } from '@/services/supabase'
import { Language } from '@/types/languages'
import { Review } from '@/types/supabase/reviews'
import { subMonths, subWeeks, subYears } from 'date-fns'

export type FullReview = Review & {
  likes_count: number
}

export type GetPopularReviewPeriod = 'last_week' | 'last_month' | 'all_time'

type GetPopularReviewsServiceParams = {
  language: Language
  period: GetPopularReviewPeriod
}

const MAX_REVIEWS = 5

export const getPopularReviewsService = async (
  params: GetPopularReviewsServiceParams,
) => {
  const { language, period } = params

  const getPeriodDates = () => {
    const today = new Date()

    if (period === 'last_week') {
      return [today, subWeeks(today, 1)]
    }

    if (period === 'last_month') {
      return [today, subMonths(today, 1)]
    }

    return [today, subYears(today, 1)]
  }

  const [lt, gt] = getPeriodDates()

  const { error, data } = await supabase
    .from('reviews_ordered_by_likes')
    .select()
    .limit(MAX_REVIEWS)
    .eq('language', language)
    .lt('created_at', lt.toISOString())
    .gt('created_at', gt.toISOString())
    .returns<FullReview[]>()

  if (error) throw new Error(error.message)

  return data
}
