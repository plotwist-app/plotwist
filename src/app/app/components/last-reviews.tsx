'use client'

import { supabase } from '@/services/supabase'
import { Review } from '@/types/supabase/reviews'
import { useQuery } from '@tanstack/react-query'

export const LastReviews = () => {
  const { data: response } = useQuery({
    queryKey: [['last-reviews']],
    queryFn: async () =>
      await supabase
        .from('reviews')
        .select()
        .order('id', { ascending: false })
        .limit(3)
        .returns<Review[]>(),
  })

  if (!response?.data) return <></>

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-normal">Last reviews</h2>

      <div className="space-y-2">
        {response.data.map((review) => (
          <div key={review.id}>{review.review}</div>
        ))}
      </div>
    </div>
  )
}
