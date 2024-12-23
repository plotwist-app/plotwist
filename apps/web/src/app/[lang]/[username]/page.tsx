'use client'

import { useLayoutContext } from './_context'
import {
  getUserActivities,
  useGetUserActivitiesInfinite,
} from '@/api/user-activities'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@plotwist/ui/components/ui/avatar'
import {
  ChangeStatusActivity,
  CreateAccountActivity,
  CreateReviewReplyActivity,
  FollowActivity,
  LikeReviewActivity,
  ListActivity,
  ListItemActivity,
  ReviewActivity,
  WatchEpisodeActivity,
} from './_components/user-activities'
import { formatDistanceToNowStrict } from 'date-fns'
import { useLanguage } from '@/context/language'
import { locale } from '@/utils/date/locale'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'
import { v4 } from 'uuid'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'

export default function ActivityPage() {
  const { userId, avatarUrl, username } = useLayoutContext()
  const { language } = useLanguage()
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

  return (
    <>
      <div className="space-y-4">
        {flatData?.map(activity => {
          const { activityType, id, createdAt } = activity

          const getLabel = () => {
            if (activityType === 'CHANGE_STATUS') {
              return <ChangeStatusActivity activity={activity} />
            }

            if (activityType === 'ADD_ITEM' || activityType === 'DELETE_ITEM') {
              return <ListItemActivity activity={activity} />
            }

            if (
              activityType === 'CREATE_LIST' ||
              activityType === 'LIKE_LIST'
            ) {
              return <ListActivity activity={activity} />
            }

            if (activityType === 'CREATE_REVIEW') {
              return <ReviewActivity activity={activity} />
            }

            if (
              activityType === 'FOLLOW_USER' ||
              activityType === 'UNFOLLOW_USER'
            ) {
              return <FollowActivity activity={activity} />
            }

            if (
              activityType === 'CREATE_REPLY' ||
              activityType === 'LIKE_REPLY'
            ) {
              return <CreateReviewReplyActivity activity={activity} />
            }

            if (activityType === 'LIKE_REVIEW') {
              return <LikeReviewActivity activity={activity} />
            }

            if (activityType === 'WATCH_EPISODE') {
              return <WatchEpisodeActivity activity={activity} />
            }

            if (activityType === 'CREATE_ACCOUNT') {
              return <CreateAccountActivity />
            }
          }

          return (
            <div key={id} className="flex gap-4 justify-between items-center">
              <div className="flex gap-2 text-xs text-muted-foreground items-center">
                <Avatar className="size-6 border text-[12px] shadow">
                  {avatarUrl && (
                    <AvatarImage src={avatarUrl} className="object-cover" />
                  )}
                  <AvatarFallback>{username[0]}</AvatarFallback>
                </Avatar>

                {getLabel()}
              </div>

              <span className="text-muted-foreground text-xs whitespace-nowrap">
                {formatDistanceToNowStrict(new Date(createdAt), {
                  addSuffix: false,
                  locale: locale[language],
                })}
              </span>
            </div>
          )
        })}
      </div>

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
    </>
  )
}
