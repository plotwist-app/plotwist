import { selectUserStats } from '@/db/repositories/user-stats'

export async function getUserStatsService(userId: string) {
  const result = await selectUserStats(userId)

  return { userStats: result }
}
