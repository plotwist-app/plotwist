'use client'

import { useLayoutContext } from './_context'
import { useGetUserActivities } from '@/api/user-activities'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@plotwist/ui/components/ui/avatar'
import {
  ChangeStatusActivity,
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

export default function ActivityPage() {
  const { userId, avatarUrl, username } = useLayoutContext()
  const { language } = useLanguage()

  const { data } = useGetUserActivities(userId, { language })

  return (
    <div className="space-y-6">
      {data?.userActivities.map(activity => {
        const { activityType, id, createdAt } = activity

        const getLabel = () => {
          if (activityType === 'CHANGE_STATUS') {
            return <ChangeStatusActivity activity={activity} />
          }

          if (activityType === 'ADD_ITEM' || activityType === 'DELETE_ITEM') {
            return <ListItemActivity activity={activity} />
          }

          if (activityType === 'CREATE_LIST' || activityType === 'LIKE_LIST') {
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
        }

        return (
          <div
            key={id}
            className="flex gap-4 justify-between items-start lg:items-center"
          >
            <div className="flex gap-2 text-sm text-muted-foreground items-start lg:items-center">
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
  )
}
