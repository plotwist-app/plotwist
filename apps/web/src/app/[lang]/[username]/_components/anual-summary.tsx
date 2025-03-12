import { useGetUserActivitiesAnualSummarySuspense } from '@/api/user-activities'
import { useSession } from '@/context/session'
import { Heatmap } from '@plotwist/ui/components/ui/heatmap'

export function AnualSummary() {
  const { user } = useSession()

  if (!user) return null

  const { data } = useGetUserActivitiesAnualSummarySuspense(user.id, {
    year: new Date().getFullYear().toString(),
  })

  return (
    <div className="">
      <Heatmap data={data.userActivities} />
    </div>
  )
}
