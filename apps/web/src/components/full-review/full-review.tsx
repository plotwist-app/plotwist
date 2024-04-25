import Image from 'next/image'
import Link from 'next/link'

import { Skeleton } from '@/components/ui/skeleton'

import { tmdbImage } from '@/utils/tmdb/image'
import { ReviewStars } from '@/components/reviews/review-stars'
import { Language } from '@/types/languages'
import { FullReview as FullReviewType } from '@/services/api/reviews'
import { ReviewLikes } from '@/components/reviews/review-likes'

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
    user: { username },
    likes_count: likes,
  } = review

  const usernameInitial = username[0]?.toUpperCase()

  const href =
    mediaType === 'MOVIE'
      ? `/${language}/movies/${tmdbId}`
      : `/${language}/tv-series/${tmdbId}`

  const userProfileHref = `/${language}/${username}`

  return (
    <div className="flex space-x-4">
      <Link href={href} className="w-2/6 md:w-1/6">
        <figure className="relative aspect-[2/3] overflow-hidden rounded-md border bg-muted shadow">
          {poster && <Image src={tmdbImage(poster)} fill alt={title} />}
        </figure>
      </Link>

      <div className="w-4/6 space-y-2 md:w-5/6">
        <h5 className="text-lg">{title}</h5>

        <div className="space-y-2">
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="flex items-center gap-x-2">
              <Link
                href={userProfileHref}
                className="flex aspect-square h-6 w-6 items-center justify-center rounded-full border text-xs"
              >
                {usernameInitial}
              </Link>

              <Link
                href={userProfileHref}
                className="text-sm text-muted-foreground"
              >
                {username}
              </Link>
            </div>

            <span className="hidden h-1 w-1 rounded-full bg-muted md:block" />

            <div className="flex items-center gap-x-2">
              <ReviewStars rating={rating} />

              {likes > 0 && (
                <>
                  <span className="h-1 w-1 rounded-full bg-muted" />

                  <ReviewLikes reviewId={review.id} />
                </>
              )}
            </div>
          </div>

          <p className="break-words text-muted-foreground">{content}</p>
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
            <Skeleton className="aspect-square h-6 w-6 rounded-full border" />
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
