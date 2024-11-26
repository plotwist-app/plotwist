'use client'

import Image from 'next/image'
import Link from 'next/link'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@plotwist/ui/components/ui/avatar'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'

import type { Language } from '@/types/languages'
import { tmdbImage } from '@/utils/tmdb/image'

import type { GetDetailedReviews200ReviewsItem } from '@/api/endpoints.schemas'
import { ReviewStars } from '@/components/reviews/review-stars'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Likes } from '../likes'
import { useLanguage } from '@/context/language'
import { format, formatDistanceToNow } from 'date-fns'
import { locale } from '@/utils/date/locale'

type FullReviewProps = {
  review: GetDetailedReviews200ReviewsItem
}

export const FullReview = ({ review }: FullReviewProps) => {
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

  const { language } = useLanguage()
  const [showSpoiler, setShowSpoiler] = useState(false)

  const usernameInitial = username.at(0)?.toUpperCase()

  const href =
    mediaType === 'MOVIE'
      ? `/${language}/movies/${tmdbId}`
      : `/${language}/tv-series/${tmdbId}`
  const userProfileHref = `/${language}/${username}`

  const time = format(new Date(createdAt), 'dd/MM/yyyy', {
    locale: locale[language],
  })

  return (
    <div className="space-y-2">
      <div className="flex space-x-4" data-testid="full-review">
        <Link href={`${href}?review=${review.id}`} className="w-2/6 md:w-1/6">
          <figure className="relative aspect-[2/3] overflow-hidden rounded-md border bg-muted">
            {posterPath && (
              <Image src={tmdbImage(posterPath)} fill alt={title} />
            )}
          </figure>
        </Link>

        <div className="w-4/6 space-y-2 md:w-5/6">
          <Link href={`${href}?review=${review.id}`} className="text-lg">
            {title}
          </Link>

          <div className="">
            <div className="flex flex-col gap-2 md:flex-row md:items-center mt-2">
              <div className="flex items-center gap-x-2">
                <Link href={userProfileHref}>
                  <Avatar className="size-8 border text-[10px] shadow">
                    {imagePath && (
                      <AvatarImage
                        src={tmdbImage(imagePath, 'w500')}
                        className="object-cover"
                      />
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
                <ReviewStars rating={rating} />

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
            <ReviewStars rating={0} />
          </div>

          <div className="space-y-1">
            <Skeleton className="aspect-square h-[1em] w-1/2" />
          </div>
        </div>
      </div>
    </div>
  )
}
