'use client'

import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import { TvShowCard } from '@/components/tv-show-card'
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

const TvShowListContent = ({ variant }: TvShowListContentProps) => {
  const { data } = useQuery({
    queryKey: [QUERY_KEY[variant]],
    queryFn: () => TMDB.tvShows[variant](),
  })

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

const queryClient = new QueryClient()

export const TvShowList = (props: TvShowListContentProps) => (
  <QueryClientProvider client={queryClient}>
    <TvShowListContent {...props} />
  </QueryClientProvider>
)
