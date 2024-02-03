'use client'

import { useQuery } from '@tanstack/react-query'
import { MovieCard, MovieCardSkeleton } from '@/components/movie-card'
import { Language } from '@/types/languages'
import { tmdb } from '@/services/tmdb'
import { MovieListType } from '@/services/tmdb/requests/movies/list'

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
        ? tmdb.movies.discover(language)
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
