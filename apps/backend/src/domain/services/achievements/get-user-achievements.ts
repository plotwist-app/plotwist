import {
  selectActiveAchievements,
  selectUserAchievements,
} from '@/infra/db/repositories/achievements-repository'
import { evaluateProgress } from './evaluate-progress'

export async function getUserAchievements(userId: string) {
  const [allAchievements, userAchievements] = await Promise.all([
    selectActiveAchievements(),
    selectUserAchievements(userId),
  ])

  const userAchMap = new Map(userAchievements.map(ua => [ua.achievementId, ua]))

  const results = await Promise.all(
    allAchievements.map(async achievement => {
      const userAch = userAchMap.get(achievement.id)
      const current = await evaluateProgress(userId, achievement.criteria)

      return {
        id: achievement.id,
        slug: achievement.slug,
        icon: achievement.icon,
        target: achievement.target,
        category: achievement.category,
        level: achievement.level,
        name: achievement.name,
        description: achievement.description,
        sortOrder: achievement.sortOrder,
        current,
        isClaimed: userAch?.isClaimed ?? false,
        isEquipped: userAch?.isEquipped ?? false,
        claimedAt: userAch?.claimedAt ?? null,
      }
    })
  )

  return results
}
