import { updateRecommendationStatus } from '@/infra/db/repositories/recommendations-repository'

export type RespondRecommendationInput = {
  id: string
  userId: string
  status: 'ACCEPTED' | 'DECLINED'
}

export async function respondRecommendationService({
  id,
  userId,
  status,
}: RespondRecommendationInput) {
  const recommendation = await updateRecommendationStatus(id, userId, status)
  return { recommendation }
}
