import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@plotwist/ui/components/ui/button'
import { useLanguage } from '@/context/language'
import { getRecommendations } from '@/services/api/recommendation/get'

import {
  ProfileRecommendation,
  ProfileRecommendationSkeleton,
} from './profile-recommendation'
import Link from 'next/link'

type ProfileRecommendationsProps = {
  userId: string
}

export const ProfileRecommendations = ({
  userId,
}: ProfileRecommendationsProps) => {
  const [variant, setVariant] = useState<'receiver' | 'sender'>('receiver')

  const { language, dictionary } = useLanguage()
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['recommendations', userId, variant, language],
    queryFn: () => getRecommendations({ userId, variant, language }),
  })

  const getContent = () => {
    const loading = !recommendations || isLoading

    if (loading)
      return (
        <div className="-ml-4 -mr-4 flex flex-col gap-4 divide-y">
          {Array.from({ length: 5 }).map((_, index) => (
            <ProfileRecommendationSkeleton key={index} />
          ))}
        </div>
      )

    const isEmpty = recommendations.length === 0
    if (isEmpty)
      return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <p className="text-md">
            {variant === 'receiver'
              ? dictionary.no_user_recommendations
              : dictionary.no_recommendations_sent}
          </p>

          <p className="text-xs text-muted-foreground">
            {variant === 'receiver'
              ? dictionary.explore_popular_movies
              : dictionary.recommend_movies_to_friends}{' '}
            <Link
              className="font-semibold hover:underline"
              href={`/${language}/movies/popular`}
            >
              {dictionary.here}
            </Link>
          </p>
        </div>
      )

    return (
      <div className="-ml-4 -mr-4 flex flex-col gap-4 divide-y">
        {recommendations.map((recommendation) => (
          <ProfileRecommendation
            recommendation={recommendation}
            key={recommendation.id}
            variant={variant}
          />
        ))}
      </div>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex space-x-2">
        <Button
          size="sm"
          variant={variant === 'receiver' ? 'default' : 'outline'}
          onClick={() => setVariant('receiver')}
        >
          {dictionary.received}
        </Button>

        <Button
          size="sm"
          variant={variant === 'sender' ? 'default' : 'outline'}
          onClick={() => setVariant('sender')}
        >
          {dictionary.sent}
        </Button>
      </div>

      {getContent()}
    </section>
  )
}
