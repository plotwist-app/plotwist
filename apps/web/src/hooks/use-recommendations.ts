'use client'

import { APP_QUERY_CLIENT } from '@/context/app'
import { useLanguage } from '@/context/language'
import { createRecommendation } from '@/services/api/recommendation/create'
import { deleteMutation } from '@/services/api/recommendation/delete'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'

export const useRecommendations = () => {
  const { dictionary } = useLanguage()
  const handleCreate = useMutation({
    mutationFn: createRecommendation,
  })

  const handleDelete = useMutation({
    mutationFn: deleteMutation,
    onSettled: async () => {
      await APP_QUERY_CLIENT.invalidateQueries({
        queryKey: ['recommendations'],
      })

      toast.success(dictionary.recommendation_deleted_successfully)
    },
  })

  return { handleCreate, handleDelete }
}
