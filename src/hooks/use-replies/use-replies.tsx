import { useMutation } from '@tanstack/react-query'

import { createReplyService } from '@/services/api/replies/create-reply'
import { deleteReplyService } from '@/services/api/replies/delete-reply'
import { likeReplyService } from '@/services/api/replies/like-reply'
import { removeLikeReplyService } from '@/services/api/replies/remove-like'

export const useReplies = () => {
  const handleCreateReply = useMutation({
    mutationFn: createReplyService,
  })

  const handleDeleteReply = useMutation({
    mutationFn: deleteReplyService,
  })

  const handleLikeReply = useMutation({
    mutationFn: likeReplyService,
  })

  const handleRemoveLikeReply = useMutation({
    mutationFn: removeLikeReplyService,
  })

  return {
    handleCreateReply,
    handleDeleteReply,
    handleLikeReply,
    handleRemoveLikeReply,
  }
}
