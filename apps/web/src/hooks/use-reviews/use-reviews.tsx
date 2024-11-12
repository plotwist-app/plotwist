import { useMutation } from '@tanstack/react-query'

import { updateReview } from '@/services/api/reviews'

import { APP_QUERY_CLIENT } from '@/context/app'

export const useReviews = () => {
  const invalidateQueries = async (reviewId: string) => {
    const queries = [
      ['user-last-review'],
      ['popular-reviews'],
      ['reviews'],
      ['likes', reviewId],
    ]

    await Promise.all(
      queries.map((queryKey) =>
        APP_QUERY_CLIENT.invalidateQueries({
          queryKey,
        }),
      ),
    )
  }

  const handleEditReview = useMutation({
    mutationFn: updateReview,
  })

  return {
    handleEditReview,
    invalidateQueries,
  }
}
