'use client'

import { useAuth } from '@/context/auth'
import { useQuery } from '@tanstack/react-query'
import { Review } from '@/types/supabase/reviews'

import Link from 'next/link'
import { useLanguage } from '@/context/language'
import { DashboardReview, DashboardReviewSkeleton } from './dashboard-review'
import { getUserLastReviewService } from '@/services/api/reviews/get-user-last-review'

type Like = {
  id: string
}

interface UserLastReview extends Review {
  likes: Like[]
}

export const DashboardUserLastReview = () => {
  const { user } = useAuth()
  const { language, dictionary } = useLanguage()

  const { data: response, isLoading } = useQuery({
    queryKey: ['dashboard-user-last-review'],
    queryFn: async () => getUserLastReviewService(user?.id ?? ''),
  })

  if (!user) {
    return (
      <span className="text-md block space-y-2">
        <Link href="/login" className="text-muted-foreground underline">
          {dictionary.dashboard.user_last_review.login}
        </Link>{' '}
        {dictionary.dashboard.user_last_review.or}{' '}
        <Link href="/signup" className="text-muted-foreground underline">
          {dictionary.dashboard.user_last_review.register}
        </Link>{' '}
        {dictionary.dashboard.user_last_review.make_first_review}
      </span>
    )
  }

  if (user && isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {dictionary.dashboard.user_last_review.title}
        </h3>
        <DashboardReviewSkeleton />
      </div>
    )
  }

  if (!response) {
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

  const lastReview = response as UserLastReview
  const likesCount = lastReview.likes?.length

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {dictionary.dashboard.user_last_review.title}
      </h3>

      <DashboardReview
        review={lastReview}
        username={user?.user_metadata.username}
        language={language}
        likes={likesCount ?? 0}
      />
    </div>
  )
}
