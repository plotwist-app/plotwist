'use client'

import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'
import Link from 'next/link'

import { useLanguage } from '@/context/language'
import { tmdbImage } from '@/utils/tmdb/image'

import { useTvSeriesListQuery } from './use-tv-series-list-query'
import { TvSeriesListProps } from './tv-series-list.types'
import { PosterCard } from '../poster-card'

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
      <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-6">
        {Array.from({ length: 20 }).map((_, index) => (
          <PosterCard.Skeleton key={index} />
        ))}
      </div>
    )

  const flatData = data.pages.flatMap((page) => page.results)
  const isLastPage =
    data.pages[data.pages.length - 1].page >=
    data.pages[data.pages.length - 1].total_pages

  return (
    <div className="flex items-center justify-between">
      <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-6">
        {flatData.map((tv) => (
          <Link href={`/${language}/tv-series/${tv.id}`} key={tv.id}>
            <PosterCard.Root>
              <PosterCard.Image
                src={tmdbImage(tv.poster_path, 'w500')}
                alt={tv.name}
              />

              <PosterCard.Details>
                <PosterCard.Title>{tv.name}</PosterCard.Title>
                <PosterCard.Year>
                  {tv.first_air_date?.split('-')[0]}
                </PosterCard.Year>
              </PosterCard.Details>
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
