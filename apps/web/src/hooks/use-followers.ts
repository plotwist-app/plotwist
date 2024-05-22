import { APP_QUERY_CLIENT } from '@/context/app'
import { createFollow } from '@/services/api/followers/create-follow'
import { deleteFollow } from '@/services/api/followers/delete-follow'
import { useMutation } from '@tanstack/react-query'

export const useFollowers = () => {
  const onSettled = async () => {
    await Promise.all(
      [['followers'], ['followers-and-following']].map(
        async (queryKey) =>
          await APP_QUERY_CLIENT.invalidateQueries({
            queryKey,
          }),
      ),
    )
  }

  const handleFollow = useMutation({
    mutationFn: createFollow,
    onSettled,
  })

  const handleRemoveFollow = useMutation({
    mutationFn: deleteFollow,
    onSettled,
  })

  return { handleFollow, handleRemoveFollow }
}
