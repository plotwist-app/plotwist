'use client'

import Image from 'next/image'
import Link from 'next/link'

import { Skeleton } from '@plotwist/ui/components/ui/skeleton'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@plotwist/ui/components/ui/avatar'

import { tmdbImage } from '@/utils/tmdb/image'
import { Language } from '@/types/languages'
import { FullReview as FullReviewType } from '@/services/api/reviews'

import { ReviewStars } from '@/components/reviews/review-stars'
import { ReviewLikes } from '@/components/reviews/review-likes'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

type FullReviewProps = {
  review: FullReviewType
  language: Language
}

export const FullReview = ({ review, language }: FullReviewProps) => {
  const {
    tmdb_poster_path: poster,
    tmdb_title: title,
    tmdb_id: tmdbId,
    media_type: mediaType,
    review: content,
    rating,
    has_spoilers: hasSpoilers,
    user: { username, image_path: imagePath },
    likes_count: likes,
  } = review

  const usernameInitial = username?.at(0)?.toUpperCase()

  const href =
    mediaType === 'MOVIE'
      ? `/${language}/movies/${tmdbId}`
      : `/${language}/tv-series/${tmdbId}`

  const userProfileHref = `/${language}/${username}`

  const [showSpoiler, setShowSpoiler] = useState(false)

  return (
    <div className="flex space-x-4" data-testid="full-review">
      <Link href={`${href}?review=${review.id}`} className="w-2/6 md:w-1/6">
        <figure className="relative aspect-[2/3] overflow-hidden rounded-md border bg-muted shadow">
          {poster && <Image src={tmdbImage(poster)} fill alt={title} />}
        </figure>
      </Link>

      <div className="w-4/6 space-y-2 md:w-5/6">
        <Link href={`${href}?review=${review.id}`} className="text-lg">
          {title}
        </Link>

        <div className="space-y-2">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
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

              {hasSpoilers && (
                <>
                  <span className="h-1 w-1 rounded-full bg-muted" />
                  <button
                    onClick={() => setShowSpoiler(!showSpoiler)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-muted-foreground/80"
                  >
                    {showSpoiler ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                    {showSpoiler ? 'Hide Spoiler' : 'Show Spoiler'}
                  </button>
                </>
              )}

              {likes > 0 && (
                <>
                  <span className="h-1 w-1 rounded-full bg-muted" />
                  <ReviewLikes reviewId={review.id} className="static" />
                </>
              )}
            </div>
          </div>

          <div className="inline-block relative rounded-md">
            {hasSpoilers && (
              <div
                className={`absolute w-full h-full inset-0 flex items-center justify-center ${
                  !showSpoiler
                    ? 'bg-black/30 backdrop-blur-sm'
                    : 'bg-transparent hover:bg-black/10'
                } rounded-md z-10 px-4 py-2 transition-colors`}
              />
            )}

            <p className="break-words text-muted-foreground p-3">{content}</p>
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
        <Skeleton className="aspect-[2/3] rounded-md border shadow" />
      </div>

      <div className="w-4/6 space-y-2 md:w-5/6">
        <Skeleton className="h-[2em] w-[10ch]" />

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Skeleton className="aspect-square size-8 rounded-full border" />
            <Skeleton className="aspect-square h-[1em] w-[10ch]" />
            <span className="h-1 w-1 rounded-full bg-muted" />
            <ReviewStars rating={0} />
          </div>

          <div className="space-y-1">
            <Skeleton className="aspect-square h-[1em] w-full" />
            <Skeleton className="aspect-square h-[1em] w-1/2" />
          </div>
        </div>
      </div>
    </div>
  )
}
