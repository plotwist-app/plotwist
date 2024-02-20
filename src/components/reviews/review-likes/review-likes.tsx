import { useAuth } from '@/context/auth'
import { supabase } from '@/services/supabase'
import { useQuery } from '@tanstack/react-query'

export function ReviewLikes({ reviewId }: { reviewId: string }) {
  const { user } = useAuth()

  const { data } = useQuery({
    queryKey: ['likes', reviewId],
    queryFn: async () =>
      supabase
        .from('likes')
        .select('user_id', { count: 'exact' })
        .eq('entity_type', 'REVIEW')
        .eq('review_id', reviewId)
        .eq('user_id', user.id),
  })

  if (!data) {
    return (
      <div className="absolute -bottom-2 right-2 h-6 w-11 animate-pulse rounded-full border bg-muted" />
    )
  }

  if (data.count === 0) return null

  return (
    <div
      className={
        'absolute -bottom-2 right-2 rounded-full border bg-muted px-3 py-1 text-xs'
      }
    >
      ❤ {data.count}
    </div>
  )
}
