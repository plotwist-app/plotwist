import { insertRecommendation } from '@/infra/db/repositories/recommendations-repository'

export type SendRecommendationInput = {
  fromUserId: string
  toUserId: string
  tmdbId: number
  mediaType: 'TV_SHOW' | 'MOVIE'
  message: string | null
}

export async function sendRecommendationService(
  input: SendRecommendationInput
) {
  const recommendation = await insertRecommendation(input)
  return { recommendation }
}
