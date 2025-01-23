'use client'

import Image from 'next/image'
import { Link } from 'next-view-transitions'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@plotwist/ui/components/ui/avatar'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'

import { tmdbImage } from '@/utils/tmdb/image'

import type { GetDetailedReviews200ReviewsItem } from '@/api/endpoints.schemas'
import { useLanguage } from '@/context/language'
import { cn } from '@/lib/utils'
import { locale } from '@/utils/date/locale'
import { Rating } from '@plotwist/ui/components/ui/rating'
import { format } from 'date-fns'
import { useState } from 'react'
import { Likes } from '../likes'
import { getEpisodeBadge, getReviewHref } from '@/utils/review'

type FullReviewProps = {
  review: GetDetailedReviews200ReviewsItem
}

type MediaType = 'MOVIE' | 'TV_SHOW'

export const FullReview = ({ review }: FullReviewProps) => {
  const {
    posterPath,
    title,
    tmdbId,
    mediaType,
    hasSpoilers,
    review: content,
    rating,
    user: { username, avatarUrl },
    likeCount,
    createdAt,
    seasonNumber,
    episodeNumber,
  } = review

  const { language } = useLanguage()
  const [showSpoiler, setShowSpoiler] = useState(false)

  const usernameInitial = username.at(0)?.toUpperCase()

  const userProfileHref = `/${language}/${username}`

  const time = format(new Date(createdAt), 'dd/MM/yyyy', {
    locale: locale[language],
  })

  const href = `${getReviewHref({ language, mediaType, tmdbId, seasonNumber, episodeNumber })}?review=${review.id}`
  const badge = getEpisodeBadge({ seasonNumber, episodeNumber })

  return (
    <div className="space-y-2">
      <div className="flex space-x-4">
        <Link href={href} className="w-2/6 md:w-1/6">
          <figure className="relative aspect-[2/3] overflow-hidden rounded-md border bg-muted">
            {posterPath && (
              <Image src={tmdbImage(posterPath)} fill alt={title} />
            )}
          </figure>
        </Link>

        <div className="w-4/6 space-y-2 md:w-5/6">
          <Link href={href} className="text-lg flex items-center">
            {title}

            {badge && (
              <span className="text-muted-foreground text-sm ml-2">
                {badge}
              </span>
            )}
          </Link>

          <div className="">
            <div className="flex flex-col gap-2 md:flex-row md:items-center mt-2">
              <div className="flex items-center gap-x-2">
                <Link href={userProfileHref}>
                  <Avatar className="size-8 border text-[10px] shadow">
                    {avatarUrl && (
                      <AvatarImage src={avatarUrl} className="object-cover" />
                    )}

                    <AvatarFallback>{usernameInitial}</AvatarFallback>
                  </Avatar>
                </Link>

                <Link
                  href={userProfileHref}
                  className="flex gap-2 text-sm text-muted-foreground"
                >
                  {username}
                </Link>
              </div>

              <span className="hidden h-1 w-1 rounded-full bg-muted md:block" />

              <div className="flex items-center gap-x-2">
                <Rating defaultRating={rating} editable={false} />

                <span className="h-1 w-1 rounded-full bg-muted" />
                <p className="text-sm text-muted-foreground">{time}</p>
              </div>
            </div>

            <p
              className={cn(
                'break-words text-muted-foreground relative mt-2 line-clamp-3 md:line-clamp-none',
                hasSpoilers &&
                  'after:w-full after:h-full after:absolute after:inset-0 after:z-10 after:bg-muted dark:after:hover:brightness-110  after:rounded-sm cursor-pointer after:hover:brightness-95 after:transition-all',
                showSpoiler && 'after:bg-muted/50 after:-z-10'
              )}
              onClick={() => setShowSpoiler(!showSpoiler)}
              onKeyDown={() => setShowSpoiler(!showSpoiler)}
            >
              {content}
            </p>

            {likeCount > 0 && (
              <div className="flex">
                <Likes
                  entityId={review.id}
                  className="static mt-4"
                  likeCount={likeCount}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export const FullReviewSkeleton = () => {
  return (
    <div className="flex space-x-4">
      <div className="w-2/6 md:w-1/6">
        <Skeleton className="aspect-[2/3] rounded-md border" />
      </div>

      <div className="w-4/6 space-y-2 md:w-5/6">
        <Skeleton className="h-[1.5em] w-[10ch]" />

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Skeleton className="aspect-square size-8 rounded-full border" />
            <Skeleton className="aspect-square h-[1em] w-[10ch]" />
            <span className="h-1 w-1 rounded-full bg-muted" />
            <Rating defaultRating={0} editable />
          </div>

          <div className="space-y-1">
            <Skeleton className="aspect-square h-[1em] w-1/2" />
          </div>
        </div>
      </div>
    </div>
  )
}
