import { updateProfileBannerPath } from '@/services/api/profiles'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const useProfile = () => {
  const queryClient = useQueryClient()

  const handleUpdateBannerPath = useMutation({
    mutationFn: updateProfileBannerPath,
    onMutate: (variables) => {
      queryClient.setQueryData(['profile-banner', variables.username], () => {
        return { banner_path: variables.newBannerPath }
      })
    },
  })

  return { handleUpdateBannerPath }
}
