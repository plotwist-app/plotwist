import { useMutation } from '@tanstack/react-query'

import { createReplyService } from '@/services/api/replies/create-reply'

export const useReplies = () => {
  const handleCreateReply = useMutation({
    mutationFn: createReplyService,
  })

  return {
    handleCreateReply,
  }
}
