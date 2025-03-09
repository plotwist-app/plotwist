import type {
  GetUserActivities200UserActivitiesItemAnyOf,
  GetUserActivities200UserActivitiesItemAnyOfFiveeight,
  GetUserActivities200UserActivitiesItemAnyOfFoureight,
  GetUserActivities200UserActivitiesItemAnyOfOnenine,
  GetUserActivities200UserActivitiesItemAnyOfOnezero,
  GetUserActivities200UserActivitiesItemAnyOfSixeight,
  GetUserActivities200UserActivitiesItemAnyOfThreeseven,
  GetUserActivities200UserActivitiesItemAnyOfTwoseven,
} from '@/api/endpoints.schemas'
import { useLanguage } from '@/context/language'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@plotwist/ui/components/ui/avatar'

import { getEpisodeBadge, getReviewHref } from '@/utils/review'
import { Rating } from '@plotwist/ui/components/ui/rating'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@plotwist/ui/components/ui/tooltip'
import { Link } from 'next-view-transitions'
import type { PropsWithChildren } from 'react'
import { v4 } from 'uuid'

export function Username({ children }: PropsWithChildren) {
  const { language } = useLanguage()

  return (
    <Link
      href={`/${language}/${children}`}
      className="text-foreground/80 font-medium hover:underline"
    >
      {children}
    </Link>
  )
}

export function ChangeStatusActivity({
  activity,
}: {
  activity: GetUserActivities200UserActivitiesItemAnyOfFiveeight
}) {
  const { language, dictionary } = useLanguage()
  const {
    owner: { username },
    additionalInfo: { title, status, mediaType, tmdbId },
  } = activity

  return (
    <div>
      <Username>{username}</Username> {dictionary.marked}{' '}
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
    owner: { username },
    additionalInfo: { mediaType, tmdbId, title, listId, listTitle },
  } = activity

  return (
    <div>
      <Username>{username}</Username>{' '}
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
  activity: GetUserActivities200UserActivitiesItemAnyOfOnenine
}) {
  const { language, dictionary } = useLanguage()
  const {
    activityType,
    owner: { username },
    additionalInfo: { id, title },
  } = activity

  return (
    <div>
      <Username>{username}</Username>{' '}
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
  activity: GetUserActivities200UserActivitiesItemAnyOfTwoseven
}) {
  const { language, dictionary } = useLanguage()
  const {
    owner: { username },
    additionalInfo: {
      mediaType,
      tmdbId,
      title,
      rating,
      seasonNumber,
      episodeNumber,
    },
    entityId,
  } = activity

  const baseHref = getReviewHref({
    language,
    mediaType,
    tmdbId,
    seasonNumber,
    episodeNumber,
  })

  const href = `${baseHref}?review=${entityId}`
  const badge = getEpisodeBadge({ seasonNumber, episodeNumber })

  return (
    <div className="flex flex-col gap-1 lg:flex-row lg:gap-2 lg:items-center">
      <span>
        <Username>{username}</Username> {dictionary.user_reviewed}{' '}
        <Link
          href={href}
          className="text-foreground/80 font-medium hover:underline"
        >
          {title}

          {badge && (
            <span className="text-muted-foreground text-sm">{badge}</span>
          )}
        </Link>
      </span>

      <Rating defaultRating={rating} size={12} editable={false} />
    </div>
  )
}

export function FollowActivity({
  activity,
}: {
  activity: GetUserActivities200UserActivitiesItemAnyOfOnezero
}) {
  const { language, dictionary } = useLanguage()
  const {
    activityType,
    owner: { username: ownerUsername },
    additionalInfo: { username, avatarUrl },
  } = activity

  return (
    <span className="flex gap-2 items-center">
      <Username>{ownerUsername}</Username>{' '}
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
  activity: GetUserActivities200UserActivitiesItemAnyOfTwoseven
}) {
  const { language, dictionary } = useLanguage()
  const {
    owner: { username },
    additionalInfo: {
      title,
      mediaType,
      tmdbId,
      author,
      seasonNumber,
      episodeNumber,
    },
    entityId,
  } = activity

  const baseHref = getReviewHref({
    language,
    mediaType,
    tmdbId,
    seasonNumber,
    episodeNumber,
  })
  const href = `${baseHref}?review=${entityId}`
  const badge = getEpisodeBadge({ seasonNumber, episodeNumber })

  return (
    <span>
      <Username>{username}</Username> {dictionary.liked_review}{' '}
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

        {badge && (
          <span className="text-muted-foreground text-sm">{badge}</span>
        )}
      </Link>
    </span>
  )
}

export function WatchEpisodeActivity({
  activity,
}: {
  activity: GetUserActivities200UserActivitiesItemAnyOfFoureight
}) {
  const { language, dictionary } = useLanguage()
  const {
    owner: { username },
    additionalInfo: { episodes, title, tmdbId },
  } = activity

  const href = `/${language}/tv-series/${tmdbId}`

  return (
    <span>
      <Username>{username}</Username> {dictionary.marked}{' '}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-foreground/80">{episodes.length} </span>
          </TooltipTrigger>
          <TooltipContent className="p-0 m-0">
            <ul className="p-2 text-xs">
              {episodes.map(episode => (
                <li key={v4()} className="whitespace-nowrap">
                  • S{episode.seasonNumber}, EP{episode.episodeNumber}
                </li>
              ))}
            </ul>
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
}: { activity: GetUserActivities200UserActivitiesItemAnyOfThreeseven }) {
  const { language, dictionary } = useLanguage()
  const {
    owner,
    activityType,
    additionalInfo: {
      review: {
        author,
        title,
        mediaType,
        tmdbId,
        id,
        seasonNumber,
        episodeNumber,
      },
    },
  } = activity

  const { username } = owner

  const baseHref = getReviewHref({
    language,
    mediaType,
    tmdbId,
    seasonNumber,
    episodeNumber,
  })
  const href = `${baseHref}?review=${id}`
  const badge = getEpisodeBadge({ seasonNumber, episodeNumber })

  return (
    <span className="">
      <Username>{username}</Username>{' '}
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

        {badge && (
          <span className="text-muted-foreground text-sm">{badge}</span>
        )}
      </Link>
    </span>
  )
}

export function CreateAccountActivity({
  activity,
}: { activity: GetUserActivities200UserActivitiesItemAnyOfSixeight }) {
  const { dictionary } = useLanguage()
  const {
    owner: { username },
  } = activity

  return (
    <div>
      <Username>{username}</Username> {dictionary.joined_plotwist}
    </div>
  )
}
