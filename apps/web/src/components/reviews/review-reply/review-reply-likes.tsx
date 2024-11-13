export function ReviewReplyLikes({ replyId }: { replyId: string }) {
  const likes = {
    count: 0,
    data: {},
    replyId,
  }

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
