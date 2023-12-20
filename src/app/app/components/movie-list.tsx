'use client'

import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
import { MovieCard, MovieCardSkeleton } from '@/components/movie-card'
import { TMDB } from '@/services/TMDB'
import { MovieListFilters } from './movie-list-filters'

const MovieListSkeleton = () => (
  <div className="grid grid-cols-3 gap-x-4 gap-y-8">
    {Array.from({ length: 10 }).map((_, i) => (
      <MovieCardSkeleton key={i} />
    ))}
  </div>
)

type Variant = 'nowPlaying' | 'popular' | 'topRated' | 'upcoming' | 'discover'

type MovieListContentProps = {
  variant: Variant
  filters?: boolean
}

const QUERY_KEY: Record<Variant, string> = {
  nowPlaying: 'now-playing',
  popular: 'popular',
  topRated: 'top-rated',
  upcoming: 'upcoming',
  discover: 'discover',
}

const MovieListContent = ({
  variant,
  filters = false,
}: MovieListContentProps) => {
  const { data } = useQuery({
    queryKey: [QUERY_KEY[variant]],
    queryFn: () =>
      variant === 'discover' ? TMDB.discover.movie() : TMDB.movies[variant](),
  })

  if (!data) return <MovieListSkeleton />

  return (
    <div className="flex items-center justify-between">
      <div className="grid grid-cols-3 gap-x-4 gap-y-8">
        {data?.results.map((movie) => (
          <MovieCard movie={movie} key={movie.id} />
        ))}
      </div>
    </div>
  )
}

const queryClient = new QueryClient()

export const MovieList = (props: MovieListContentProps) => (
  <QueryClientProvider client={queryClient}>
    <MovieListContent {...props} />
  </QueryClientProvider>
)
