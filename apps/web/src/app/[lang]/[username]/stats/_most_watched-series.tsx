'use client'

import { useGetUserIdMostWatchedSeriesSuspense } from '@/api/user-stats'
import { PosterCard } from '@/components/poster-card'
import { useLanguage } from '@/context/language'
import { tmdbImage } from '@/utils/tmdb/image'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@plotwist/ui/components/ui/card'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'
import { Trophy } from 'lucide-react'
import { Link } from 'next-view-transitions'
import { v4 } from 'uuid'
import { useLayoutContext } from '../_context'

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
          {!data.mostWatchedSeries.length &&
            Array.from({ length: 3 }, () => (
              <div
                className="border border-dashed aspect-poster rounded-md"
                key={v4()}
              />
            ))}

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

export function MostWatchedSeriesSkeleton() {
  const { dictionary } = useLanguage()

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
          {Array.from({ length: 3 }, () => (
            <PosterCard.Root key={v4()}>
              <PosterCard.Skeleton />

              <p className="text-xs text-muted-foreground text-center lowercase flex items-center gap-2 justify-center">
                <Skeleton className="w-[2ch] aspect-square" />{' '}
                {dictionary.episodes}
              </p>
            </PosterCard.Root>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
