import { Review } from '@/types/supabase/reviews'
import { tmdbImage } from '@/utils/tmdb/image'
import Image from 'next/image'
import { ReviewStars } from './review-stars'
import { Skeleton } from '@/components/ui/skeleton'

type LastReviewItemProps = { review: Review }

export const LastReviewItem = ({ review }: LastReviewItemProps) => {
  const {
    tmdb_poster_path: poster,
    tmdb_title: title,
    review: content,
    rating,
    user_info: {
      raw_user_meta_data: { username },
    },
  } = review
  const usernameInitial = username[0].toUpperCase()

  return (
    <div className="flex space-x-4">
      <div className="w-1/6">
        <figure className="relative aspect-[2/3] overflow-hidden rounded-md border bg-muted shadow">
          {poster && <Image src={tmdbImage(poster)} fill alt={title} />}
        </figure>
      </div>

      <div className="w-5/6 space-y-2">
        <h5 className="text-xl">{title}</h5>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="flex aspect-square h-6 w-6 items-center justify-center rounded-full border">
              {usernameInitial}
            </div>
            <span className="text-sm text-muted-foreground">{username}</span>

            <span className="h-1 w-1 rounded-full bg-muted" />

            <ReviewStars rating={rating} />
          </div>

          <p className="text-muted-foreground">{content}</p>
        </div>
      </div>
    </div>
  )
}

export const LastReviewItemSkeleton = () => {
  return (
    <div className="flex space-x-4">
      <div className="w-1/6">
        <Skeleton className="aspect-[2/3] rounded-md border shadow" />
      </div>

      <div className="w-5/6 space-y-2">
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
