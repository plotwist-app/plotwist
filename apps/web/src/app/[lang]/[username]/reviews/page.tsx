import { FullReviewSkeleton } from '@/components/full-review'
import { Suspense } from 'react'
import { Reviews } from './_reviews'

export default async function ReviewsPage() {
  return (
    <Suspense fallback={<FullReviewSkeleton />}>
      <Reviews />
    </Suspense>
  )
}
