import type {
  GetUserActivities200UserActivitiesItemAnyOf,
  GetUserActivities200UserActivitiesItemAnyOfFivetwo,
  GetUserActivities200UserActivitiesItemAnyOfFourthree,
  GetUserActivities200UserActivitiesItemAnyOfNine,
  GetUserActivities200UserActivitiesItemAnyOfOneseven,
  GetUserActivities200UserActivitiesItemAnyOfThreethree,
  GetUserActivities200UserActivitiesItemAnyOfTwofour,
} from '@/api/endpoints.schemas'
import { useLanguage } from '@/context/language'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@plotwist/ui/components/ui/avatar'

import { Rating } from '@plotwist/ui/components/ui/rating'
import { ScrollArea } from '@plotwist/ui/components/ui/scroll-area'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@plotwist/ui/components/ui/tooltip'
import Link from 'next/link'
import { v4 } from 'uuid'
import { useLayoutContext } from '../_context'

export function ChangeStatusActivity({
  activity,
}: {
  activity: GetUserActivities200UserActivitiesItemAnyOfFivetwo
}) {
  const { language, dictionary } = useLanguage()
  const { username } = useLayoutContext()

  const { title, status, mediaType, tmdbId } = activity.additionalInfo

  return (
    <div>
      {dictionary.marked}{' '}
      <Link
        href={`/${language}/${mediaType === 'TV_SHOW' ? 'tv-series' : 'movies'}/${tmdbId}`}
        className="text-foreground/80 font-medium hover:underline"
      >
        {title}
      </Link>{' '}
      {dictionary.as}{' '}
      <Link
        className="text-foreground/80 font-medium hover:underline"
        href={`/${language}/${username}/collection?status=${status}`}
      >
        {status === 'WATCHED' && dictionary.watched}
        {status === 'WATCHING' && dictionary.watching}
        {status === 'WATCHLIST' && dictionary.watchlist}
        {status === 'DROPPED' && dictionary.dropped}
      </Link>
    </div>
  )
}

export function ListItemActivity({
  activity,
}: {
  activity: GetUserActivities200UserActivitiesItemAnyOf
}) {
  const { language, dictionary } = useLanguage()
  const {
    activityType,
    additionalInfo: { mediaType, tmdbId, title, listId, listTitle },
  } = activity

  return (
    <div>
      {activityType === 'ADD_ITEM' ? dictionary.added : dictionary.removed}{' '}
      <Link
        className="text-foreground/80 font-medium hover:underline"
        href={`/${language}/${mediaType === 'TV_SHOW' ? 'tv-series' : 'movies'}/${tmdbId}`}
      >
        {title}
      </Link>{' '}
      {activityType === 'ADD_ITEM' ? dictionary.to : dictionary.from}{' '}
      <Link
        className="text-foreground/80 font-medium hover:underline"
        href={`/${language}/lists/${listId}`}
      >
        {listTitle}
      </Link>
    </div>
  )
}

export function ListActivity({
  activity,
}: {
  activity: GetUserActivities200UserActivitiesItemAnyOfOneseven
}) {
  const { language, dictionary } = useLanguage()
  const {
    additionalInfo: { id, title },
    activityType,
  } = activity

  return (
    <div>
      {activityType === 'CREATE_LIST'
        ? dictionary.created_list
        : dictionary.liked_list}{' '}
      <Link
        href={`/${language}/lists/${id}`}
        className="text-foreground/80 font-medium hover:underline"
      >
        {title}
      </Link>
    </div>
  )
}

export function ReviewActivity({
  activity,
}: {
  activity: GetUserActivities200UserActivitiesItemAnyOfTwofour
}) {
  const { language, dictionary } = useLanguage()
  const {
    additionalInfo: { mediaType, tmdbId, title, rating },
    entityId,
  } = activity

  const href = `/${language}/${mediaType === 'TV_SHOW' ? 'tv-series' : 'movies'}/${tmdbId}?review=${entityId}`

  return (
    <div className="flex flex-col  gap-1 lg:flex-row lg:gap-2 lg:items-center">
      <span>
        {dictionary.user_reviewed}{' '}
        <Link
          href={href}
          className="text-foreground/80 font-medium hover:underline"
        >
          {title}
        </Link>
      </span>

      <Rating defaultRating={rating} size={12} editable={false} />
    </div>
  )
}

export function FollowActivity({
  activity,
}: {
  activity: GetUserActivities200UserActivitiesItemAnyOfNine
}) {
  const { language, dictionary } = useLanguage()
  const {
    additionalInfo: { username, avatarUrl },
    activityType,
  } = activity

  return (
    <span className="flex gap-2 items-center">
      <span>
        {activityType === 'FOLLOW_USER'
          ? dictionary.followed
          : dictionary.unfollowed}
      </span>
      <Link href={`/${language}/${username}`}>
        <Avatar className="size-6 border text-[12px] shadow">
          {avatarUrl && (
            <AvatarImage src={avatarUrl} className="object-cover" />
          )}
          <AvatarFallback>{username[0]}</AvatarFallback>
        </Avatar>
      </Link>

      <Link
        className="text-foreground/80 font-medium hover:underline"
        href={`/${language}/${username}`}
      >
        <span>{username}</span>
      </Link>
    </span>
  )
}

export function LikeReviewActivity({
  activity,
}: {
  activity: GetUserActivities200UserActivitiesItemAnyOfTwofour
}) {
  const {
    additionalInfo: { title, mediaType, tmdbId, author },
    entityId,
  } = activity

  const { language, dictionary } = useLanguage()

  const href = `/${language}/${mediaType === 'TV_SHOW' ? 'tv-series' : 'movies'}/${tmdbId}?review=${entityId}`

  return (
    <span>
      {dictionary.liked_review}{' '}
      <Link
        className="text-foreground/80 font-medium hover:underline"
        href={`/${language}/${author.username}`}
      >
        <span>{author.username}</span>
      </Link>{' '}
      <span className="lowercase">{dictionary.about}</span>{' '}
      <Link
        className="text-foreground/80 font-medium hover:underline"
        href={href}
      >
        {title}
      </Link>
    </span>
  )
}

export function WatchEpisodeActivity({
  activity,
}: {
  activity: GetUserActivities200UserActivitiesItemAnyOfFourthree
}) {
  const {
    additionalInfo: { episodes, title, tmdbId },
  } = activity

  const { language, dictionary } = useLanguage()
  const href = `/${language}/tv-series/${tmdbId}`

  return (
    <span>
      {dictionary.marked}{' '}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-foreground/80">{episodes.length} </span>
          </TooltipTrigger>
          <TooltipContent className="p-0 m-0">
            <ScrollArea className="h-[200px]">
              <ul className="p-2 text-xs">
                {episodes.map(episode => (
                  <li key={v4()} className="whitespace-nowrap">
                    • S{episode.seasonNumber}, EP{episode.episodeNumber}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <span className="lowercase">
        {episodes.length > 1 ? dictionary.episodes : dictionary.episode}
      </span>{' '}
      {dictionary.from}{' '}
      <Link
        className="text-foreground/80 font-medium hover:underline"
        href={href}
      >
        {title}
      </Link>{' '}
      {dictionary.as}{' '}
      <span className="text-foreground/80 font-medium">
        {dictionary.watched}
      </span>
    </span>
  )
}

export function CreateReviewReplyActivity({
  activity,
}: { activity: GetUserActivities200UserActivitiesItemAnyOfThreethree }) {
  const { language, dictionary } = useLanguage()
  const {
    additionalInfo: {
      review: { author, title, mediaType, tmdbId, id },
    },
    activityType,
  } = activity

  const href = `/${language}/${mediaType === 'TV_SHOW' ? 'tv-series' : 'movies'}/${tmdbId}?review=${id}`

  return (
    <span className="">
      {activityType === 'CREATE_REPLY'
        ? dictionary.replied_to_review
        : dictionary.liked_reply}{' '}
      <Link
        className="text-foreground/80 font-medium hover:underline"
        href={`/${language}/${author.username}`}
      >
        <span>{author.username}</span>
      </Link>{' '}
      <span className="lowercase">{dictionary.about}</span>{' '}
      <Link
        className="text-foreground/80 font-medium hover:underline"
        href={href}
      >
        {title}
      </Link>
    </span>
  )
}

export function CreateAccountActivity() {
  const { dictionary } = useLanguage()

  return <div>{dictionary.joined_plotwist}</div>
}
