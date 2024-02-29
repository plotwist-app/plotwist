'use client'

import { useAuth } from '@/context/auth'
import { supabase } from '@/services/supabase'
import { useQuery } from '@tanstack/react-query'
import { Review } from '@/types/supabase/reviews'

import Link from 'next/link'
import { useLanguage } from '@/context/language'
import { DashboardReview, DashboardReviewSkeleton } from './dashboard-review'

export const DashboardUserLastReview = () => {
  const { user } = useAuth()
  const { language, dictionary } = useLanguage()

  const { data: response, isLoading } = useQuery({
    queryKey: ['dashboard-user-last-review'],
    queryFn: async () =>
      await supabase
        .from('reviews')
        .select(`*, likes(id)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single(),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {dictionary.dashboard.user_last_review.title}
        </h3>
        <DashboardReviewSkeleton />
      </div>
    )
  }

  if (!response?.data) return <></>

  const lastReview = response.data as Review

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {dictionary.dashboard.user_last_review.title}
      </h3>

      {lastReview ? (
        <DashboardReview
          review={lastReview}
          username={user.user_metadata.username}
          language={language}
        />
      ) : (
        <div className="justify flex flex-col items-center justify-center space-y-1 rounded-md border border-dashed px-4 py-8 text-center">
          <p>{dictionary.dashboard.user_last_review.no_review_message}</p>

          <Link
            href={`/${language}/app/movies/top-rated`}
            className="text-sm text-muted-foreground"
          >
            {dictionary.dashboard.user_last_review.no_review_action}
          </Link>
        </div>
      )}
    </div>
  )
}
