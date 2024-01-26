'use client'

import { useAuth } from '@/context/auth'
import { supabase } from '@/services/supabase'
import { useQuery } from '@tanstack/react-query'
import { Review } from '@/types/supabase/reviews'
import { DashboardReview, DashboardReviewSkeleton } from './dashboard-review'
import Link from 'next/link'
import { useLanguage } from '@/context/language'

export const DashboardUserLastReview = () => {
  const { user } = useAuth()
  const { language } = useLanguage()

  const { data: response, isLoading } = useQuery({
    queryKey: ['dashboard-user-last-review'],
    queryFn: async () =>
      await supabase
        .from('reviews_with_user')
        .select()
        .order('id', { ascending: false })
        .eq('user_id', user.id)
        .limit(1)
        .returns<Review[]>(),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your last review</h3>
        <DashboardReviewSkeleton />
      </div>
    )
  }

  if (!response?.data) return <></>

  const lastReview = response.data[0]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Your last review</h3>

      {lastReview ? (
        <DashboardReview review={lastReview} language={language} />
      ) : (
        <div className="justify flex flex-col items-center justify-center space-y-1 rounded-md border border-dashed px-4 py-8 text-center">
          <p>You haven&apos;t reviewed any movies or TV shows.</p>

          <p className="text-sm text-muted-foreground">
            Click to see top rated{' '}
            <Link className="hover:underline" href="/app/movies/top-rated">
              Movies
            </Link>{' '}
            or{' '}
            <Link className="hover:underline" href="/app/tv-shows/top-rated">
              TV Shows
            </Link>{' '}
            .
          </p>
        </div>
      )}
    </div>
  )
}
