import { Suspense } from 'react'
import { Reviews } from './_reviews'
import { FullReviewSkeleton } from '@/components/full-review'

export default async function ReviewsPage() {
  return (
    <Suspense fallback={<FullReviewSkeleton />}>
      <Reviews />
    </Suspense>
  )
}
