'use client'

import Image from 'next/image'
import Link from 'next/link'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@plotwist/ui/components/ui/avatar'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'

import { tmdbImage } from '@/utils/tmdb/image'

import type { GetDetailedReviews200ReviewsItem } from '@/api/endpoints.schemas'
import { ReviewStars } from '@/components/reviews/review-stars'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Likes } from '../likes'
import { Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { locale } from '@/utils/date/locale'
import { useLanguage } from '@/context/language'

type TimelineReviewProps = {
  review: GetDetailedReviews200ReviewsItem
}

export const TimelineReview = ({ review }: TimelineReviewProps) => {
  const {
    posterPath,
    title,
    tmdbId,
    mediaType,
    hasSpoilers,
    review: content,
    rating,
    user: { username, imagePath },
    likeCount,
    createdAt,
  } = review

  const { dictionary, language } = useLanguage()

  const usernameInitial = username.at(0)?.toUpperCase()

  const href =
    mediaType === 'MOVIE'
      ? `/${language}/movies/${tmdbId}`
      : `/${language}/tv-series/${tmdbId}`

  const userProfileHref = `/${language}/${username}`

  const [showSpoiler, setShowSpoiler] = useState(false)

  const time = `${formatDistanceToNow(new Date(createdAt), {
    locale: locale[language],
  })} ${dictionary.ago}`

  return (
    <div className="flex space-x-4" data-testid="full-review">
      <div className="relative">
        <Link href={userProfileHref}>
          <Avatar className="size-8 border text-[10px]">
            {imagePath && (
              <AvatarImage
                src={tmdbImage(imagePath, 'w500')}
                className="object-cover"
              />
            )}

            <AvatarFallback>{usernameInitial}</AvatarFallback>
          </Avatar>
        </Link>

        <div className="absolute top-12 bottom-0 left-1/2 w-[2px] bg-muted" />
      </div>

      <div className="flex-1 space-y-4">
        <p className="flex-1 text-sm">
          <Link href={userProfileHref} className="inline-block">
            {username}
          </Link>
          <span className="text-muted-foreground"> reviewed </span>
          <Link href={`${href}?review=${review.id}`} className="inline-block">
            {title}
          </Link>
        </p>

        <div className="grid grid-cols-[75px_1fr] sm:grid-cols-[100px_1fr] gap-4">
          <Link href={`${href}?review=${review.id}`} className="w-full">
            <figure className="relative aspect-[2/3] overflow-hidden rounded-md border bg-muted">
              {posterPath && (
                <Image src={tmdbImage(posterPath)} fill alt={title} />
              )}
            </figure>
          </Link>

          <div className="space-y-2">
            <ReviewStars rating={rating} />
            <p
              className={cn(
                'break-words text-muted-foreground relative line-clamp-3',
                hasSpoilers &&
                  'after:w-full after:h-full after:absolute after:inset-0 after:z-10 after:bg-muted dark:after:hover:brightness-110  after:rounded-sm cursor-pointer after:hover:brightness-95 after:transition-all',
                showSpoiler && 'after:bg-muted/50 after:-z-10'
              )}
              onClick={() => setShowSpoiler(!showSpoiler)}
              onKeyDown={() => setShowSpoiler(!showSpoiler)}
            >
              {content}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="flex gap-2 text-xs items-center text-muted-foreground rounded-sm">
            <Clock size={14} />
            {time}
          </div>

          {likeCount > 0 && (
            <Likes
              entityId={review.id}
              className="static rounded-md border-none bg-transparent hover:bg-muted text-muted-foreground"
              likeCount={likeCount}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export const TimelineReviewSkeleton = () => {
  return <div>skeleton</div>
}
