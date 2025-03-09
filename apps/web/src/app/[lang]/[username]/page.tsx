'use client'

import {
  getUserActivities,
  useGetUserActivitiesInfinite,
} from '@/api/user-activities'
import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { v4 } from 'uuid'
import { UserActivity } from './_components/user-activity'
import { useLayoutContext } from './_context'

export default function ActivityPage() {
  const { userId } = useLayoutContext()
  const { language } = useLanguage()
  const session = useSession()

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isLoading } =
    useGetUserActivitiesInfinite(
      userId,
      { language },
      {
        query: {
          initialPageParam: undefined,
          getNextPageParam: lastPage => lastPage.nextCursor,
          queryFn: async ({ pageParam }) => {
            return await getUserActivities(userId, {
              pageSize: '20',
              cursor: pageParam as string,
              language,
            })
          },
        },
      }
    )

  const { ref, inView } = useInView({
    threshold: 0.1,
  })

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const flatData = data?.pages.flatMap(page => page.userActivities)
  const isOwner = session.user?.id === userId

  return (
    <>
      <div className="space-y-4">
        {flatData?.map(activity => (
          <UserActivity key={activity.id} activity={activity} />
        ))}

        {(isFetchingNextPage || isLoading) &&
          Array.from({ length: 20 }).map(_ => (
            <div key={v4()} className="flex items-center">
              <div className="flex items-center">
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="w-[10ch] h-[2ex] ml-2 mr-2" />
              </div>

              <Skeleton className="w-[5ch] h-[1.5ex] ml-auto" />
            </div>
          ))}

        {hasNextPage && !(isFetchingNextPage || isLoading) && (
          <div className="flex items-center" ref={ref}>
            <div className="flex items-center">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="w-[10ch] h-[2ex] ml-2 mr-2" />
            </div>

            <Skeleton className="w-[5ch] h-[1.5ex] ml-auto" />
          </div>
        )}
      </div>
    </>
  )
}
