import { getLikesService } from '@/services/api/likes/get-likes'
import { useQuery } from '@tanstack/react-query'

export function ReviewReplyLikes({ replyId }: { replyId: string }) {
  const { data: likes } = useQuery({
    queryKey: ['likes', replyId],
    queryFn: async () => getLikesService({ id: replyId, entityType: 'REPLY' }),
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
