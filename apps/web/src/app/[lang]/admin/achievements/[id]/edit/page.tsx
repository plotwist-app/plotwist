import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAdminAchievementsId } from '@/api/admin-achievements'
import { verifySession } from '@/app/lib/dal'
import { AchievementForm } from '../../_components/achievement-form'

export const metadata: Metadata = {
  title: 'Edit Achievement • Plotwist Admin',
}

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditAchievementPage({ params }: Props) {
  await verifySession()
  const { id } = await params

  try {
    const { data } = await getAdminAchievementsId(id)
    return <AchievementForm achievement={data.achievement} />
  } catch {
    notFound()
  }
}
