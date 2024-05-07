import { useMutation } from '@tanstack/react-query'

import { createReply, deleteReply, updateReply } from '@/services/api/replies'
import { APP_QUERY_CLIENT } from '@/context/app'

export const useReplies = () => {
  const invalidateQueries = async (id: string) => {
    const queries = [[id], ['reviews']]

    await Promise.all(
      queries.map(
        async (queryKey) =>
          await APP_QUERY_CLIENT.invalidateQueries({
            queryKey,
          }),
      ),
    )
  }

  const handleCreateReply = useMutation({
    mutationFn: createReply,
  })

  const handleEditReply = useMutation({
    mutationFn: updateReply,
  })

  const handleDeleteReply = useMutation({
    mutationFn: deleteReply,
  })

  return {
    handleCreateReply,
    handleDeleteReply,
    handleEditReply,
    invalidateQueries,
  }
}
