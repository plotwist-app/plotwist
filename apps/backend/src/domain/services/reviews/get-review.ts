import { selectReview } from '@/db/repositories/reviews-repository'
import { withServiceTracing } from '@/infra/telemetry/with-service-tracing'
import type { getReviewQuerySchema } from '@/http/schemas/reviews'

export type GetReviewInput = {
  mediaType: (typeof getReviewQuerySchema._type)['mediaType']
  tmdbId: number
  userId: string
  seasonNumber?: number
  episodeNumber?: number
}

const getReviewServiceImpl = async (input: GetReviewInput) => {
  const [review] = await selectReview(input)

  return { review: review || null }
}

export const getReviewService = withServiceTracing(
  'get-review',
  getReviewServiceImpl
)
