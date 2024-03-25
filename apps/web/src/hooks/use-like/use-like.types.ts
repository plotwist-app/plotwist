export type LikeValues = {
  userId: string
  entityType: 'REVIEW' | 'REPLY'
  replyId?: string
  reviewId?: string
}
