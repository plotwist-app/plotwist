'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

import { useLanguage } from '@/context/language'
import { tmdbImage } from '@/utils/tmdb/image'

import { v4 } from 'uuid'
import { PosterCard } from '../poster-card'
import type { TvSeriesListProps } from './tv-series-list.types'
import { useTvSeriesListQuery } from './use-tv-series-list-query'
import { useUserPreferences } from '@/context/user-preferences'
import { Badge } from '@plotwist/ui/components/ui/badge'

export const TvSeriesList = ({ variant }: TvSeriesListProps) => {
  const { language, dictionary } = useLanguage()
  const { userPreferences } = useUserPreferences()
  const { ref, inView } = useInView({
    threshold: 0,
  })

  const { data, fetchNextPage } = useTvSeriesListQuery(variant)

  useEffect(() => {
    if (inView) fetchNextPage()
  }, [fetchNextPage, inView])

  if (!data)
    return (
      <div className="grid w-full grid-cols-3 gap-4 md:grid-cols-6">
        {Array.from({ length: 20 }).map(() => (
          <PosterCard.Skeleton key={v4()} />
        ))}
      </div>
    )

  const flatData = data.pages.flatMap(page => page.results)
  const isLastPage =
    data.pages[data.pages.length - 1].page >=
    data.pages[data.pages.length - 1].total_pages

  const hasPreferences =
    userPreferences?.watchProvidersIds &&
    userPreferences?.watchProvidersIds.length > 0

  return (
    <div className="space-y-4">
      {hasPreferences && (
        <Badge>{dictionary.available_on_streaming_services}</Badge>
      )}

      <div className="grid w-full grid-cols-3 gap-4 md:grid-cols-6">
        {flatData.map(tv => (
          <Link href={`/${language}/tv-series/${tv.id}`} key={tv.id}>
            <PosterCard.Root>
              <PosterCard.Image
                src={tmdbImage(tv.poster_path, 'w500')}
                alt={tv.name}
              />
            </PosterCard.Root>
          </Link>
        ))}

        {!isLastPage && (
          <>
            <PosterCard.Skeleton ref={ref} />
            <PosterCard.Skeleton />
            <PosterCard.Skeleton />
          </>
        )}
      </div>
    </div>
  )
}
