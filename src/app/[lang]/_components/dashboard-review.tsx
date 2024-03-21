import Image from 'next/image'
import Link from 'next/link'

import { Skeleton } from '@/components/ui/skeleton'

import { Review } from '@/types/supabase/reviews'
import { tmdbImage } from '@/utils/tmdb/image'
import { ReviewStars } from '@/components/reviews/review-stars'
import { Language } from '@/types/languages'

type DashboardReviewProps = { review: Review; language: Language }

export const DashboardReview = ({ review, language }: DashboardReviewProps) => {
  const {
    tmdb_poster_path: poster,
    tmdb_title: title,
    tmdb_id: tmdbId,
    media_type: mediaType,
    review: content,
    rating,
    review_likes: likes,
    user_info: {
      raw_user_meta_data: { username },
    },
  } = review

  const usernameInitial = username[0].toUpperCase()

  const href =
    mediaType === 'MOVIE'
      ? `/${language}/movies/${tmdbId}`
      : `/${language}/tv-series/${tmdbId}`

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
              <div className="flex aspect-square h-6 w-6 items-center justify-center rounded-full border text-xs">
                {usernameInitial}
              </div>
              <span className="text-sm text-muted-foreground">{username}</span>
            </div>

            <span className="hidden h-1 w-1 rounded-full bg-muted md:block" />

            <div className="flex items-center gap-x-2">
              <ReviewStars rating={rating} />

              {likes?.length && (
                <>
                  <span className="h-1 w-1 rounded-full bg-muted" />

                  <div className="rounded-full border bg-muted px-3 py-1 text-xs">
                    ❤ {likes.length}
                  </div>
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

export const DashboardReviewSkeleton = () => {
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
