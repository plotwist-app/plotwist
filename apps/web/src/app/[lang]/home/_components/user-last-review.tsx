'use client'

import Link from 'next/link'

import { useLanguage } from '@/context/language'
import { useSession } from '@/context/session'

import {
  FullReview,
  FullReviewSkeleton,
} from '@/components/full-review/full-review'
import { useGetDetailedReviews } from '@/api/reviews'

export const EmptyReview = () => {
  const { language, dictionary } = useLanguage()

  return (
    <div className="justify flex flex-col items-center justify-center space-y-1 rounded-md border border-dashed px-4 py-8 text-center">
      <p>{dictionary.user_last_review.no_review_message}</p>

      <Link
        href={`/${language}/movies/top-rated`}
        className="text-sm text-muted-foreground"
      >
        {dictionary.user_last_review.no_review_action}
      </Link>
    </div>
  )
}

export const UserLastReview = () => {
  const { user } = useSession()
  const { language, dictionary } = useLanguage()
  console.log({ user })

  const { data, isLoading } = useGetDetailedReviews({
    language,
    userId: user?.id,
    limit: '1',
  })

  if (!user) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed p-16">
        <span className="lg:text-md block space-y-2 text-center text-sm text-muted-foreground">
          <Link href="/sign-in" className="text-foreground underline">
            {dictionary.user_last_review.login}
          </Link>{' '}
          {dictionary.user_last_review.or}{' '}
          <Link href="/sign-up" className="text-foreground underline">
            {dictionary.user_last_review.register}
          </Link>{' '}
          {dictionary.user_last_review.make_first_review}
        </span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {dictionary.user_last_review.title}
        </h3>

        <FullReviewSkeleton />
      </div>
    )
  }

  if (!data?.reviews[0]) {
    return (
      <div className="justify flex flex-col items-center justify-center space-y-1 rounded-md border border-dashed px-4 py-8 text-center">
        <p>{dictionary.user_last_review.no_review_message}</p>

        <Link
          href={`/${language}/movies/top-rated`}
          className="text-sm text-muted-foreground"
        >
          {dictionary.user_last_review.no_review_action}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {dictionary.user_last_review.title}
      </h3>

      <FullReview review={data.reviews[0]} language={language} />
    </div>
  )
}
