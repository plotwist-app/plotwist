'use client'

import { useInView } from 'react-intersection-observer'
import { forwardRef, useEffect } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'

import { MovieCard, MovieCardSkeleton } from '@/components/movie-card'
import { Language } from '@/types/languages'

import { tmdb } from '@/services/tmdb'
import { MovieListType } from '@/services/tmdb/requests/movies/list'

const MovieListSkeleton = forwardRef<HTMLDivElement>((_, ref) => (
  <div
    className="grid w-full grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-3"
    ref={ref}
  >
    {Array.from({ length: 10 }).map((_, i) => (
      <MovieCardSkeleton key={i} />
    ))}
  </div>
))
MovieListSkeleton.displayName = 'MovieListSkeleton'

type Variant = MovieListType | 'discover'

type MovieListContentProps = {
  variant: Variant
  language: Language
}

export const MovieList = ({ variant, language }: MovieListContentProps) => {
  const { ref, inView } = useInView({
    threshold: 0,
  })

  const searchParams = useSearchParams()

  const genres = searchParams.get('genres')
  const startDate = searchParams.get('release_date.gte')
  const endDate = searchParams.get('release_date.lte')
  const originaLanguage = searchParams.get('with_original_language')

  const { data, fetchNextPage } = useInfiniteQuery({
    queryKey: [variant, genres, startDate, endDate, originaLanguage],
    queryFn: ({ pageParam }) =>
      variant === 'discover'
        ? tmdb.movies.discover({
            filters: {
              with_genres: genres,
              'release_date.gte': startDate,
              'release_date.lte': endDate,
              with_original_language: originaLanguage,
            },
            language,
            page: pageParam,
          })
        : tmdb.movies.list({
            language,
            list: variant,
            page: pageParam,
          }),
    getNextPageParam: (lastPage) => lastPage.page + 1,
    initialPageParam: 1,
  })

  useEffect(() => {
    if (inView) fetchNextPage()
  }, [fetchNextPage, inView])

  if (!data) return <MovieListSkeleton />

  const flatData = data.pages.flatMap((page) => page.results)
  const isLastPage =
    data.pages[data.pages.length - 1].page >=
    data.pages[data.pages.length - 1].total_pages

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="grid w-full grid-cols-1 gap-x-4 gap-y-8 md:grid-cols-3">
          {flatData.map((movie) => (
            <MovieCard movie={movie} key={movie.id} language={language} />
          ))}

          {!isLastPage && (
            <>
              <MovieCardSkeleton ref={ref} />
              <MovieCardSkeleton />
              <MovieCardSkeleton />
            </>
          )}
        </div>
      </div>
    </>
  )
}
