import { Suspense } from 'react'
import { FullReviewSkeleton } from '@/components/full-review'
import { Reviews } from './_reviews'

export default async function ReviewsPage() {
  return (
    <Suspense fallback={<FullReviewSkeleton />}>
      <Reviews />
    </Suspense>
  )
}
