'use client'

import { Button } from '@plotwist/ui/components/ui/button'
import { Star } from 'lucide-react'
import { useParams, usePathname } from 'next/navigation'
import { Suspense } from 'react'
import { useGetReviewSuspense } from '@/api/reviews'
import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'
import { cn } from '@/lib/utils'
import { ReviewFormDialog } from '../reviews/review-form-dialog'

function ItemReviewContent() {
  const pathname = usePathname()
  const { id, seasonNumber, episodeNumber } = useParams<{
    id: string
    seasonNumber?: string
    episodeNumber?: string
  }>()

  const mediaType = pathname.includes('tv-series') ? 'TV_SHOW' : 'MOVIE'
  const tmdbId = Number(id)

  const { data } = useGetReviewSuspense({
    mediaType,
    tmdbId: String(tmdbId),
    seasonNumber,
    episodeNumber,
  })

  const { dictionary } = useLanguage()

  const review =
    data.data && 'review' in data.data ? data.data.review : undefined
  return (
    <ReviewFormDialog
      tmdbId={tmdbId}
      mediaType={mediaType}
      review={review}
      key={JSON.stringify(review)}
    >
      <Button size="sm" variant="outline">
        <Star
          size={14}
          className={cn('mr-2', review && 'fill-amber-400 text-amber-400')}
        />
        {review ? dictionary.reviewed : dictionary.review}
      </Button>
    </ReviewFormDialog>
  )
}

export function ItemReview() {
  const { user } = useSession()
  if (!user) return

  return (
    <Suspense>
      <ItemReviewContent />
    </Suspense>
  )
}
