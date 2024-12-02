'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@plotwist/ui/components/ui/card'
import { Trophy } from 'lucide-react'
import { useLayoutContext } from '../_context'
import { useGetUserIdMostWatchedSeriesSuspense } from '@/api/user-stats'
import { PosterCard } from '@/components/poster-card'
import { tmdbImage } from '@/utils/tmdb/image'
import { useLanguage } from '@/context/language'
import Link from 'next/link'

export function MostWatchedSeries() {
  const { userId } = useLayoutContext()
  const { language, dictionary } = useLanguage()

  const { data } = useGetUserIdMostWatchedSeriesSuspense(userId, {
    language,
  })

  return (
    <Card className="sm:col-span-1 col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {dictionary.most_watched_series}
        </CardTitle>
        <Trophy className="size-4 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-3 gap-1.5">
          {data.mostWatchedSeries.map(({ id, title, posterPath, episodes }) => (
            <Link
              href={`/${language}/tv-series/${id}`}
              className="space-y-2"
              key={id}
            >
              <PosterCard.Root>
                {posterPath && (
                  <PosterCard.Image
                    src={tmdbImage(posterPath, 'w500')}
                    alt={title}
                  />
                )}

                <p className="text-xs text-muted-foreground text-center lowercase">
                  {episodes} {dictionary.episodes}
                </p>
              </PosterCard.Root>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
