'use client'

import { useGetNetworkActivitiesSuspense } from '@/api/user-activities'
import { useSession } from '@/context/session'
import { UserActivity } from '../../[username]/_components/user-activity'

export function NetworkActivity() {
  const { user } = useSession()
  if (!user) return null

  const { data } = useGetNetworkActivitiesSuspense({
    userId: user.id,
    pageSize: '10',
  })

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Network Activity</h3>
      </div>

      <div className="space-y-4">
        {data.userActivities.map(activity => (
          <UserActivity key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  )
}
