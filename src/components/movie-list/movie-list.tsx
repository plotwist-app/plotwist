'use client'

import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'

import { MovieCard, MovieCardSkeleton } from '@/components/movie-card'

import { MovieListSkeleton } from './movie-list-skeleton'
import { useMovieListQuery } from './use-movie-list-query'
import { MovieListProps } from './movie-list.types'

export const MovieList = ({ variant, language }: MovieListProps) => {
  const { data, fetchNextPage } = useMovieListQuery(variant)
  const { ref, inView } = useInView({
    threshold: 0,
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
