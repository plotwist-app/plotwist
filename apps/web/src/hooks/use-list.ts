import { APP_QUERY_CLIENT } from '@/context/app'
import { likeList, removeLike } from '@/services/api/lists'
import { useMutation } from '@tanstack/react-query'

export const useList = () => {
  const handleLike = useMutation({
    mutationFn: likeList,
    onSettled: async (listId) => {
      await APP_QUERY_CLIENT.invalidateQueries({
        queryKey: ['list', listId],
      })
    },
  })

  const handleRemoveLike = useMutation({
    mutationFn: removeLike,
    onSettled: async () => {
      await APP_QUERY_CLIENT.invalidateQueries({
        queryKey: ['list'],
      })
    },
  })

  return { handleLike, handleRemoveLike }
}
