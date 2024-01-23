'use client'

import { useQuery } from '@tanstack/react-query'
import { TvShowCard, TvShowCardSkeleton } from '@/components/tv-show-card'
import { TMDB } from '@/services/TMDB'

type Variant = 'airingToday' | 'onTheAir' | 'popular' | 'topRated'

type TvShowListContentProps = {
  variant: Variant
}

const QUERY_KEY: Record<Variant, string> = {
  airingToday: 'airing-today',
  onTheAir: 'on-the-air',
  popular: 'popular',
  topRated: 'top-rated',
}

const TvShowListSkeleton = () => (
  <div className="grid grid-cols-3 gap-x-4 gap-y-8">
    {Array.from({ length: 10 }).map((_, i) => (
      <TvShowCardSkeleton key={i} />
    ))}
  </div>
)

export const TvShowList = ({ variant }: TvShowListContentProps) => {
  const { data } = useQuery({
    queryKey: [QUERY_KEY[variant]],
    queryFn: () => TMDB.tvShows[variant](),
  })

  if (!data) return <TvShowListSkeleton />

  return (
    <div className="flex items-center justify-between">
      <div className="grid grid-cols-3 gap-x-4 gap-y-8">
        {data?.results.map((tvShow) => (
          <TvShowCard tvShow={tvShow} key={tvShow.id} />
        ))}
      </div>
    </div>
  )
}
