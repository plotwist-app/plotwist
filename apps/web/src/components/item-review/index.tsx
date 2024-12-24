'use client'

import { useGetReviewSuspense } from '@/api/reviews'
import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'
import { Button } from '@plotwist/ui/components/ui/button'
import { Star } from 'lucide-react'
import { useParams, usePathname } from 'next/navigation'
import { Suspense } from 'react'
import { ReviewFormDialog } from '../reviews/review-form-dialog'
import { cn } from '@/lib/utils'

function ItemReviewContent() {
  const pathname = usePathname()
  const params = useParams<{ id: string }>()

  const mediaType = pathname.includes('tv-series') ? 'TV_SHOW' : 'MOVIE'
  const tmdbId = Number(params.id)

  const { data } = useGetReviewSuspense({ mediaType, tmdbId: String(tmdbId) })
  const { dictionary } = useLanguage()

  return (
    <ReviewFormDialog
      tmdbId={tmdbId}
      mediaType={mediaType}
      review={data.review}
    >
      <Button size="sm" variant="outline">
        <Star
          size={14}
          className={cn('mr-2', data.review && 'fill-amber-400 text-amber-400')}
        />
        {data.review ? dictionary.reviewed : dictionary.review}
      </Button>
    </ReviewFormDialog>
  )
}

export function ItemReview() {
  const { user } = useSession()
  if (!user) return

  return (
    <Suspense fallback>
      <ItemReviewContent />
    </Suspense>
  )
}
