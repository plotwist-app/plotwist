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

export const TvSeriesList = ({ variant }: TvSeriesListProps) => {
  const { language } = useLanguage()
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
        {Array.from({ length: 20 }).map((_, index) => (
          <PosterCard.Skeleton key={v4()} />
        ))}
      </div>
    )

  const flatData = data.pages.flatMap(page => page.results)
  const isLastPage =
    data.pages[data.pages.length - 1].page >=
    data.pages[data.pages.length - 1].total_pages

  return (
    <div className="flex items-center justify-between">
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
