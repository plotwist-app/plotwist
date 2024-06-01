'use client'

import { createRecommendation } from '@/services/api/recommendation/create'
import { useMutation } from '@tanstack/react-query'

export const useRecommendations = () => {
  const handleCreate = useMutation({
    mutationFn: createRecommendation,
  })

  return { handleCreate }
}
