import { selectReview } from '@/db/repositories/reviews-repository'
import type { getReviewQuerySchema } from '@/http/schemas/reviews'

export type GetReviewInput = {
  mediaType: (typeof getReviewQuerySchema._type)['mediaType']
  tmdbId: number
  userId: string
  seasonNumber?: number
  episodeNumber?: number
}

export async function getReviewService(input: GetReviewInput) {
  const [review] = await selectReview(input)

  return { review: review || null }
}
