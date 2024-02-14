'use client'

import { useQuery } from '@tanstack/react-query'
import { MovieCard, MovieCardSkeleton } from '@/components/movie-card'
import { Language } from '@/types/languages'
import { tmdb } from '@/services/tmdb'
import { MovieListType } from '@/services/tmdb/requests/movies/list'
import { useSearchParams } from 'next/navigation'

const MovieListSkeleton = () => (
  <div className="grid w-full grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-3">
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
  const searchParams = useSearchParams()
  const genres = searchParams.get('genres')
  const startDate = searchParams.get('release_date.gte')
  const endDate = searchParams.get('release_date.lte')

  const { data } = useQuery({
    queryKey: [variant, genres, startDate, endDate],
    queryFn: () =>
      variant === 'discover'
        ? tmdb.movies.discover(language, {
            with_genres: genres,
            'release_date.gte': startDate,
            'release_date.lte': endDate,
          })
        : tmdb.movies.list(variant, language),
  })

  if (!data) return <MovieListSkeleton />

  return (
    <div className="flex items-center justify-between">
      <div className="grid w-full grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-3">
        {data?.results.map((movie) => (
          <MovieCard movie={movie} key={movie.id} language={language} />
        ))}
      </div>
    </div>
  )
}
