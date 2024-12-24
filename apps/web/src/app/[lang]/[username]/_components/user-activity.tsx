'use client'

import type { GetUserActivities200UserActivitiesItem } from '@/api/endpoints.schemas'
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
} from './user-activities'
import { format, formatDistanceToNowStrict } from 'date-fns'
import { locale } from '@/utils/date/locale'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@plotwist/ui/components/ui/avatar'
import { useLayoutContext } from '../_context'
import { useLanguage } from '@/context/language'

import { Button } from '@plotwist/ui/components/ui/button'
import { Trash } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type TouchEvent, useState } from 'react'
import { useMediaQuery } from '@/hooks/use-media-query'
import {
  getGetUserActivitiesQueryKey,
  useDeleteUserActivity,
} from '@/api/user-activities'
import { APP_QUERY_CLIENT } from '@/context/app'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@plotwist/ui/components/ui/tooltip'

type UserActivityProps = {
  activity: GetUserActivities200UserActivitiesItem
}

const getLabel = (activity: GetUserActivities200UserActivitiesItem) => {
  const { activityType } = activity

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

  if (activityType === 'FOLLOW_USER' || activityType === 'UNFOLLOW_USER') {
    return <FollowActivity activity={activity} />
  }

  if (activityType === 'CREATE_REPLY' || activityType === 'LIKE_REPLY') {
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

export function EditableUserActivity({ activity }: UserActivityProps) {
  const { createdAt } = activity

  const { avatarUrl, username } = useLayoutContext()
  const { language } = useLanguage()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const { mutateAsync } = useDeleteUserActivity()

  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [isSwipedLeft, setIsSwipedLeft] = useState(false)

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    setStartX(event.touches[0].clientX)
    setIsSwiping(true)
  }

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (!isSwiping) return

    const deltaX = event.touches[0].clientX - startX

    if ((!isSwipedLeft && deltaX < 0) || (isSwipedLeft && deltaX > 0)) {
      setCurrentX(deltaX)
    }
  }

  const handleTouchEnd = () => {
    setIsSwiping(false)

    if (currentX < -32) {
      setIsSwipedLeft(true)
      return setCurrentX(-32)
    }

    if (currentX > 32 && isSwipedLeft) {
      setIsSwipedLeft(false)
      return setCurrentX(0)
    }

    setCurrentX(isSwipedLeft ? -32 : 0)
  }

  return (
    <div
      className={cn('relative group')}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={cn(
          'flex gap-4 justify-between items-center group z-10  bg-background',
          isSwipedLeft && '-translate-x-8',
          isDesktop && 'transform group-hover:!-translate-x-8 transition'
        )}
        style={{
          transform: `translateX(${currentX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease',
        }}
      >
        <div className="flex gap-2 text-sm lg:text-md text-muted-foreground items-center">
          <Avatar className="size-6 lg:size-7 border text-[12px] shadow">
            {avatarUrl && (
              <AvatarImage src={avatarUrl} className="object-cover" />
            )}
            <AvatarFallback>{username[0]}</AvatarFallback>
          </Avatar>

          {getLabel(activity)}
        </div>

        <div className="flex gap-2 items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className="text-muted-foreground text-xs whitespace-nowrap">
                  {formatDistanceToNowStrict(new Date(activity.createdAt), {
                    addSuffix: false,
                    locale: locale[language],
                  })}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <span>
                  {format(new Date(activity.createdAt), 'PPP', {
                    locale: locale[language],
                  })}
                </span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div
        className={cn(
          'text-sm flex absolute right-0 top-0 lg:top-1 -z-10 group-hover:z-10'
        )}
      >
        <Button
          size="sm"
          className="size-6 p-0"
          variant="outline"
          onClick={() =>
            mutateAsync(
              { activityId: activity.id },
              {
                onSuccess: () => {
                  APP_QUERY_CLIENT.invalidateQueries({
                    queryKey: getGetUserActivitiesQueryKey(activity.userId),
                  })
                },
              }
            )
          }
        >
          <Trash size={12} />
        </Button>
      </div>
    </div>
  )
}

export function UserActivity({ activity }: UserActivityProps) {
  const { avatarUrl, username } = useLayoutContext()
  const { language } = useLanguage()

  return (
    <div className={cn('flex gap-4 justify-between items-center')}>
      <div className="flex gap-2 text-sm lg:text-md text-muted-foreground items-center">
        <Avatar className="size-6 desktop:size-8 border text-[12px] shadow">
          {avatarUrl && (
            <AvatarImage src={avatarUrl} className="object-cover" />
          )}
          <AvatarFallback>{username[0]}</AvatarFallback>
        </Avatar>

        {getLabel(activity)}
      </div>

      <div className="flex gap-2 items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span className="text-muted-foreground text-xs whitespace-nowrap">
                {formatDistanceToNowStrict(new Date(activity.createdAt), {
                  addSuffix: false,
                  locale: locale[language],
                })}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <span>
                {format(new Date(activity.createdAt), 'PPP', {
                  locale: locale[language],
                })}
              </span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  )
}
