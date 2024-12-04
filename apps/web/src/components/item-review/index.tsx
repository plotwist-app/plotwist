'use client'

import { Button } from '@plotwist/ui/components/ui/button'
import { ReviewFormDialog } from '../reviews/review-form-dialog'
import { Star } from 'lucide-react'
import { useGetReviewSuspense } from '@/api/reviews'
import { useSession } from '@/context/session'
import { Suspense } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { useLanguage } from '@/context/language'

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
      <Button size="sm" variant={data.review ? 'default' : 'outline'}>
        <Star size={14} className="mr-2" />
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
