'use client'

import { useQuery } from '@tanstack/react-query'
import { TvShowCard, TvShowCardSkeleton } from '@/components/tv-show-card'
import { TvShowsListType } from '@/services/tmdb/requests/tv-series/list'
import { tmdb } from '@/services/tmdb'
import { Language } from '@/types/languages'

type Variant = TvShowsListType

type TvShowListContentProps = {
  variant: Variant
  language: Language
}

const TvShowListSkeleton = () => (
  <div className="grid grid-cols-3 gap-x-4 gap-y-8">
    {Array.from({ length: 10 }).map((_, i) => (
      <TvShowCardSkeleton key={i} />
    ))}
  </div>
)

export const TvShowList = ({ variant, language }: TvShowListContentProps) => {
  const { data } = useQuery({
    queryKey: [variant],
    queryFn: () => tmdb.tvSeries.list(variant, language),
  })

  if (!data) return <TvShowListSkeleton />

  return (
    <div className="flex items-center justify-between">
      <div className="grid grid-cols-3 gap-x-4 gap-y-8">
        {data?.results.map((tvShow) => (
          <TvShowCard tvShow={tvShow} key={tvShow.id} language={language} />
        ))}
      </div>
    </div>
  )
}
