'use client'

import { TvSerieCard, TvSerieCardSkeleton } from '@/components/tv-serie-card'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'

import { useLanguage } from '@/context/language'

import { useTvSeriesListQuery } from './use-tv-series-list-query'
import { TvSeriesListProps } from './tv-series-list.types'
import { TvSeriesListSkeleton } from './tv-series-list-skeleton'

export const TvSeriesList = ({ variant }: TvSeriesListProps) => {
  const { language } = useLanguage()
  const { ref, inView } = useInView({
    threshold: 0,
  })

  const { data, fetchNextPage } = useTvSeriesListQuery(variant)

  useEffect(() => {
    if (inView) fetchNextPage()
  }, [fetchNextPage, inView])

  if (!data) return <TvSeriesListSkeleton />

  const flatData = data.pages.flatMap((page) => page.results)
  const isLastPage =
    data.pages[data.pages.length - 1].page >=
    data.pages[data.pages.length - 1].total_pages

  return (
    <div className="flex items-center justify-between">
      <div className="grid w-full grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-3">
        {flatData.map((tvSerie) => (
          <TvSerieCard tvSerie={tvSerie} key={tvSerie.id} language={language} />
        ))}

        {!isLastPage && (
          <>
            <TvSerieCardSkeleton ref={ref} />
            <TvSerieCardSkeleton />
            <TvSerieCardSkeleton />
          </>
        )}
      </div>
    </div>
  )
}
