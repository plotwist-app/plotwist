'use client'

import { TvShowCard, TvShowCardSkeleton } from '@/components/tv-show-card'
import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'

import { useLanguage } from '@/context/language'

import { useTvShowsListQuery } from './use-tv-shows-list-query'
import { TvShowListProps } from './tv-shows-list.types'
import { TvShowsListSkeleton } from './tv-shows-list-skeleton'

export const TvShowsList = ({ variant }: TvShowListProps) => {
  const { language } = useLanguage()
  const { ref, inView } = useInView({
    threshold: 0,
  })

  const { data, fetchNextPage } = useTvShowsListQuery(variant)

  useEffect(() => {
    if (inView) fetchNextPage()
  }, [fetchNextPage, inView])

  if (!data) return <TvShowsListSkeleton />

  const flatData = data.pages.flatMap((page) => page.results)
  const isLastPage =
    data.pages[data.pages.length - 1].page >=
    data.pages[data.pages.length - 1].total_pages

  return (
    <div className="flex items-center justify-between">
      <div className="grid w-full grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-3">
        {flatData.map((tvShow) => (
          <TvShowCard tvShow={tvShow} key={tvShow.id} language={language} />
        ))}

        {!isLastPage && (
          <>
            <TvShowCardSkeleton ref={ref} />
            <TvShowCardSkeleton />
            <TvShowCardSkeleton />
          </>
        )}
      </div>
    </div>
  )
}
