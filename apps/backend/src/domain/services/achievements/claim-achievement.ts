import { DomainError } from '@/domain/errors/domain-error'
import {
  selectAchievementById,
  selectUserAchievement,
  upsertUserAchievement,
} from '@/infra/db/repositories/achievements-repository'
import { evaluateProgress } from './evaluate-progress'

export async function claimAchievement(userId: string, achievementId: string) {
  const achievement = await selectAchievementById(achievementId)
  if (!achievement) {
    return new DomainError('Achievement not found', 404)
  }

  if (!achievement.isActive) {
    return new DomainError('Achievement is not active', 400)
  }

  const existingClaim = await selectUserAchievement(userId, achievementId)
  if (existingClaim?.isClaimed) {
    return new DomainError('Achievement already claimed', 400)
  }

  const current = await evaluateProgress(userId, achievement.criteria)
  if (current < achievement.target) {
    return new DomainError('Achievement not yet completed', 400)
  }

  const userAchievement = await upsertUserAchievement({
    userId,
    achievementId,
    isClaimed: true,
    isEquipped: true,
    claimedAt: new Date(),
  })

  return { userAchievement }
}
