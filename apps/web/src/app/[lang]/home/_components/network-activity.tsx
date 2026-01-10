'use client'

import { useGetNetworkActivitiesSuspense } from '@/api/user-activities'
import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'
import { UserActivity } from '../../[username]/_components/user-activity'

function NetworkActivityContent({ userId }: { userId: string }) {
  const { dictionary } = useLanguage()
  const { data } = useGetNetworkActivitiesSuspense({
    userId,
    pageSize: '15',
  })

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{dictionary.network_activity}</h3>
      </div>

      <div className="space-y-4">
        {data.userActivities.map(activity => (
          <UserActivity key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  )
}

export function NetworkActivity() {
  const { user } = useSession()

  if (!user) return null

  return <NetworkActivityContent userId={user.id} />
}
