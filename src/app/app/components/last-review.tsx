'use client'

import { useAuth } from '@/context/auth'
import { supabase } from '@/services/supabase'
import { useQuery } from '@tanstack/react-query'
import { LastReviewItem, LastReviewItemSkeleton } from './last-review-item'
import { Review } from '@/types/supabase/reviews'

export const LastReview = () => {
  const { user } = useAuth()

  const { data: response, isLoading } = useQuery({
    queryKey: ['last-review'],
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

        <LastReviewItemSkeleton />
      </div>
    )
  }

  if (!response?.data) return <></>

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Your last review</h3>

      <LastReviewItem review={response.data[0]} />
    </div>
  )
}
