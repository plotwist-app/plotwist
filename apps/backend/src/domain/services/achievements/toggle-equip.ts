import { DomainError } from '@/domain/errors/domain-error'
import {
  selectUserAchievement,
  updateUserAchievementEquip,
} from '@/infra/db/repositories/achievements-repository'

export async function toggleEquipAchievement(
  userId: string,
  achievementId: string,
  isEquipped: boolean
) {
  const userAchievement = await selectUserAchievement(userId, achievementId)

  if (!userAchievement) {
    return new DomainError('Achievement not found for user', 404)
  }

  if (!userAchievement.isClaimed) {
    return new DomainError('Achievement must be claimed before equipping', 400)
  }

  const updated = await updateUserAchievementEquip(
    userId,
    achievementId,
    isEquipped
  )

  return { userAchievement: updated }
}
