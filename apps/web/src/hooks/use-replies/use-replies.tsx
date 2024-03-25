import { useMutation } from '@tanstack/react-query'

import { createReplyService } from '@/services/api/replies/create-reply'
import { deleteReplyService } from '@/services/api/replies/delete-reply'

export const useReplies = () => {
  const handleCreateReply = useMutation({
    mutationFn: createReplyService,
  })

  const handleDeleteReply = useMutation({
    mutationFn: deleteReplyService,
  })

  return {
    handleCreateReply,
    handleDeleteReply,
  }
}
