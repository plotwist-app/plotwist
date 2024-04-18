'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'

import { useAuth } from '@/context/auth'

import { useLanguage } from '@/context/language'

import { getUserLastReviewService } from '@/services/api/reviews/get-user-last-review'

import {
  FullReview,
  FullReviewSkeleton,
} from '@/components/full-review/full-review'

export const EmptyReview = () => {
  const { language, dictionary } = useLanguage()

  return (
    <div className="justify flex flex-col items-center justify-center space-y-1 rounded-md border border-dashed px-4 py-8 text-center">
      <p>{dictionary.dashboard.user_last_review.no_review_message}</p>

      <Link
        href={`/${language}/movies/top-rated`}
        className="text-sm text-muted-foreground"
      >
        {dictionary.dashboard.user_last_review.no_review_action}
      </Link>
    </div>
  )
}

export const DashboardUserLastReview = () => {
  const { user } = useAuth()
  const { language, dictionary } = useLanguage()

  const { data: lastReview, isLoading } = useQuery({
    queryKey: ['dashboard-user-last-review'],
    queryFn: async () =>
      getUserLastReviewService({
        userId: user?.id ?? '',
      }),
  })

  if (!user) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed p-16">
        <span className="text-md block space-y-2 text-muted-foreground">
          <Link href="/login" className="text-foreground underline">
            {dictionary.dashboard.user_last_review.login}
          </Link>{' '}
          {dictionary.dashboard.user_last_review.or}{' '}
          <Link href="/signup" className="text-foreground underline">
            {dictionary.dashboard.user_last_review.register}
          </Link>{' '}
          {dictionary.dashboard.user_last_review.make_first_review}
        </span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {dictionary.dashboard.user_last_review.title}
        </h3>

        <FullReviewSkeleton />
      </div>
    )
  }

  if (!lastReview) {
    return (
      <div className="justify flex flex-col items-center justify-center space-y-1 rounded-md border border-dashed px-4 py-8 text-center">
        <p>{dictionary.dashboard.user_last_review.no_review_message}</p>

        <Link
          href={`/${language}/movies/top-rated`}
          className="text-sm text-muted-foreground"
        >
          {dictionary.dashboard.user_last_review.no_review_action}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {dictionary.dashboard.user_last_review.title}
      </h3>

      <FullReview review={lastReview} language={language} />
    </div>
  )
}
