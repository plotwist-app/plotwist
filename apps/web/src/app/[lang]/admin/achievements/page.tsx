import type { Metadata } from 'next'
import { getAdminAchievements } from '@/api/admin-achievements'
import { verifySession } from '@/app/lib/dal'
import { AchievementsAdmin } from './_components/achievements-admin'

export const metadata: Metadata = {
  title: 'Achievements Admin • Plotwist',
}

export default async function AchievementsAdminPage() {
  await verifySession()
  const { data } = await getAdminAchievements()
  return <AchievementsAdmin initialAchievements={data.achievements} />
}
