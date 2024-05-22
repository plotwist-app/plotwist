import { APP_QUERY_CLIENT } from '@/context/app'
import { createFollow } from '@/services/api/followers/create-follow'
import { deleteFollow } from '@/services/api/followers/delete-follow'
import { useMutation } from '@tanstack/react-query'

export const useFollowers = () => {
  const handleFollow = useMutation({
    mutationFn: createFollow,
    onSettled: async () => {
      await APP_QUERY_CLIENT.invalidateQueries({ queryKey: ['followers'] })
    },
  })

  const handleRemoveFollow = useMutation({
    mutationFn: deleteFollow,
    onSettled: async () => {
      await APP_QUERY_CLIENT.invalidateQueries({ queryKey: ['followers'] })
    },
  })

  return { handleFollow, handleRemoveFollow }
}
