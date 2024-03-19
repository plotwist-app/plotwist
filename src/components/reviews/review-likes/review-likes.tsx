import { getLikesService } from '@/services/api/likes/get-likes'
import { useQuery } from '@tanstack/react-query'

export function ReviewLikes({ reviewId }: { reviewId: string }) {
  const { data: likes } = useQuery({
    queryKey: ['likes', reviewId],
    queryFn: async () =>
      getLikesService({ id: reviewId, entityType: 'REVIEW' }),
  })

  if (!likes?.data) {
    return (
      <div className="absolute -bottom-2 right-2 h-6 w-11 animate-pulse rounded-full border bg-muted" />
    )
  }

  if (likes.count === 0) return null

  return (
    <div
      className={
        'absolute -bottom-2 right-2 rounded-full border bg-muted px-3 py-1 text-xs'
      }
    >
      ❤ {likes.count}
    </div>
  )
}
