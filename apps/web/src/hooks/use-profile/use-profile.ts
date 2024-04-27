import {
  updateProfileBannerPath,
  updateProfileUsername,
} from '@/services/api/profiles'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const useProfile = () => {
  const queryClient = useQueryClient()

  const updateBannerPathMutation = useMutation({
    mutationFn: updateProfileBannerPath,
    onMutate: (variables) => {
      queryClient.setQueryData(['profile-banner', variables.username], () => {
        return { banner_path: variables.newBannerPath }
      })
    },
  })

  const updateUsernameMutation = useMutation({
    mutationFn: updateProfileUsername,
  })

  return { updateBannerPathMutation, updateUsernameMutation }
}
