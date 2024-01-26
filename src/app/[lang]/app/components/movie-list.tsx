'use client'

import { useQuery } from '@tanstack/react-query'
import { MovieCard, MovieCardSkeleton } from '@/components/movie-card'
import { TMDB } from '@/services/TMDB'
import { Language } from '@/types/languages'
import { tmdb } from '@/services/tmdb2'
import { MovieListType } from '@/services/tmdb2/requests/movies/list'

const MovieListSkeleton = () => (
  <div className="grid grid-cols-3 gap-x-4 gap-y-8">
    {Array.from({ length: 10 }).map((_, i) => (
      <MovieCardSkeleton key={i} />
    ))}
  </div>
)

type Variant = MovieListType | 'discover'

type MovieListContentProps = {
  variant: Variant
  language: Language
}

export const MovieList = ({ variant, language }: MovieListContentProps) => {
  const { data } = useQuery({
    queryKey: [variant],
    queryFn: () =>
      variant === 'discover'
        ? TMDB.discover.movie()
        : tmdb.movies.list(variant, language),
  })

  if (!data) return <MovieListSkeleton />

  return (
    <div className="flex items-center justify-between">
      <div className="grid grid-cols-3 gap-x-4 gap-y-8">
        {data?.results.map((movie) => (
          <MovieCard movie={movie} key={movie.id} language={language} />
        ))}
      </div>
    </div>
  )
}
