import type { Metadata } from 'next'
import { AchievementForm } from '../_components/achievement-form'

export const metadata: Metadata = {
  title: 'New Achievement • Plotwist Admin',
}

export default function NewAchievementPage() {
  return <AchievementForm />
}
