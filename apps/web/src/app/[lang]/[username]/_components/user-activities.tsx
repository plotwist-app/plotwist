import type {
  GetUserActivities200UserActivitiesItemAnyOf,
  GetUserActivities200UserActivitiesItemAnyOfOnefive,
  GetUserActivities200UserActivitiesItemAnyOfOneone,
  GetUserActivities200UserActivitiesItemAnyOfSix,
  GetUserActivities200UserActivitiesItemAnyOfThreefour,
  GetUserActivities200UserActivitiesItemAnyOfTwoeight,
  GetUserActivities200UserActivitiesItemAnyOfTwoone,
} from '@/api/endpoints.schemas'
import { useLanguage } from '@/context/language'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@plotwist/ui/components/ui/avatar'

import { Rating } from '@plotwist/ui/components/ui/rating'
import Link from 'next/link'

export function ChangeStatusActivity({
  activity,
}: {
  activity: GetUserActivities200UserActivitiesItemAnyOfThreefour
}) {
  const { language, dictionary } = useLanguage()
  const { title, status, mediaType, tmdbId } = activity.additionalInfo

  return (
    <div>
      Marcou{' '}
      <Link
        href={`/${language}/${mediaType === 'TV_SHOW' ? 'tv-series' : 'movies'}/${tmdbId}`}
        className="text-foreground/80 font-medium hover:underline"
      >
        {title}
      </Link>{' '}
      como{' '}
      <span className="text-foreground/80 font-medium">
        {status === 'WATCHED' && dictionary.watched}
        {status === 'WATCHING' && dictionary.watching}
        {status === 'WATCHLIST' && dictionary.watchlist}
      </span>
    </div>
  )
}

export function ListItemActivity({
  activity,
}: {
  activity: GetUserActivities200UserActivitiesItemAnyOf
}) {
  const { language } = useLanguage()
  const {
    activityType,
    additionalInfo: { mediaType, tmdbId, title, listId, listTitle },
  } = activity

  return (
    <div>
      {activityType === 'ADD_ITEM' ? 'Adicionou' : 'Removeu'}{' '}
      <Link
        className="text-foreground/80 font-medium hover:underline"
        href={`/${language}/${mediaType === 'TV_SHOW' ? 'tv-series' : 'movies'}/${tmdbId}`}
      >
        {title}
      </Link>{' '}
      {activityType === 'ADD_ITEM' ? 'à' : 'de'}{' '}
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
  activity: GetUserActivities200UserActivitiesItemAnyOfOneone
}) {
  const { language } = useLanguage()
  const {
    additionalInfo: { id, title },
    activityType,
  } = activity

  return (
    <div>
      {activityType === 'CREATE_LIST' ? 'Criou a lista' : 'Curtiu a lista'}{' '}
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
  activity: GetUserActivities200UserActivitiesItemAnyOfOnefive
}) {
  const { language } = useLanguage()
  const {
    additionalInfo: { mediaType, tmdbId, title, rating },
  } = activity

  const href = `/${language}/${mediaType === 'TV_SHOW' ? 'tv-series' : 'movies'}/${tmdbId}`

  return (
    <div className="flex gap-2 items-center">
      <span>
        Avaliou{' '}
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
  activity: GetUserActivities200UserActivitiesItemAnyOfSix
}) {
  const { language } = useLanguage()
  const {
    additionalInfo: { username, avatarUrl },
    activityType,
  } = activity

  return (
    <span className="flex gap-2 items-center">
      <span>
        {activityType === 'FOLLOW_USER' ? 'Seguiu' : 'Deixou de seguir'}
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

// export function ReplyActivity({
//   activity,
// }: {
//   activity: GetUserActivities200UserActivitiesItemAnyOfTwozero
// }) {
//   const {
//     additionalInfo: { reply },
//   } = activity

//   return <span>Respondeu à "{reply}"</span>
// }

export function LikeReviewActivity({
  activity,
}: {
  activity: GetUserActivities200UserActivitiesItemAnyOfOnefive
}) {
  const {
    additionalInfo: { title, mediaType, tmdbId, author },
  } = activity

  const { language } = useLanguage()

  const href = `/${language}/${mediaType === 'TV_SHOW' ? 'tv-series' : 'movies'}/${tmdbId}`

  return (
    <span>
      Curtiu a análise de{' '}
      <Link
        className="text-foreground/80 font-medium hover:underline"
        href={`/${language}/${author.username}`}
      >
        <span>{author.username}</span>
      </Link>{' '}
      sobre{' '}
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
  activity: GetUserActivities200UserActivitiesItemAnyOfTwoeight
}) {
  const {
    additionalInfo: { episodes, title, tmdbId },
  } = activity

  const { language } = useLanguage()

  const href = `/${language}/TV_SHOW/${tmdbId}`

  return (
    <span>
      Assistiu <span className="text-foreground/80">{episodes.length}</span>{' '}
      {episodes.length > 1 ? 'episódios' : 'episódio'} de{' '}
      <Link
        className="text-foreground/80 font-medium hover:underline"
        href={href}
      >
        {title}
      </Link>
    </span>
  )
}

export function CreateReviewReplyActivity({
  activity,
}: { activity: GetUserActivities200UserActivitiesItemAnyOfTwoone }) {
  const { language } = useLanguage()
  const {
    additionalInfo: {
      review: { author, title, mediaType, tmdbId },
    },
    activityType,
  } = activity

  const href = `/${language}/${mediaType === 'TV_SHOW' ? 'tv-series' : 'movies'}/${tmdbId}`

  return (
    <span className="">
      {activityType === 'CREATE_REPLY'
        ? 'Respondeu a análise de '
        : 'Curtiu a resposta de '}
      <Link
        className="text-foreground/80 font-medium hover:underline"
        href={`/${language}/${author.username}`}
      >
        <span>{author.username}</span>
      </Link>{' '}
      sobre{' '}
      <Link
        className="text-foreground/80 font-medium hover:underline"
        href={href}
      >
        {title}
      </Link>
    </span>
  )
}
