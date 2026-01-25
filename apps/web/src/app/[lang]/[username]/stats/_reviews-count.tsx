'use client'

import NumberFlow from '@number-flow/react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@plotwist/ui/components/ui/card'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'
import { Star } from 'lucide-react'
import { useGetUserIdReviewsCountSuspense } from '@/api/user-stats'
import { useLanguage } from '@/context/language'
import { useLayoutContext } from '../_context'

export function ReviewsCount() {
  const { userId } = useLayoutContext()
  const { dictionary } = useLanguage()
  const { data } = useGetUserIdReviewsCountSuspense(userId)

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {dictionary.reviews}
        </CardTitle>

        <Star className="size-4 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <NumberFlow className="text-2xl font-bold" value={data.reviewsCount} />

        <p className="text-xs text-muted-foreground lowercase">
          {dictionary.reviews_conducted}
        </p>
      </CardContent>
    </Card>
  )
}

export function ReviewsCountSkeleton() {
  const { dictionary } = useLanguage()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {dictionary.reviews}
        </CardTitle>

        <Star className="size-4 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-bold items-center gap-2 flex">
          <Skeleton className="w-[5ch] h-[2.5ex]" />
        </div>

        <Skeleton className="w-[10ch] h-[1.5ex] mt-4" />
      </CardContent>
    </Card>
  )
}
