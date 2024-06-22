'use client'

import { useInView } from 'react-intersection-observer'
import { useEffect } from 'react'
import Link from 'next/link'

import { MovieListSkeleton } from './movie-list-skeleton'
import { useMovieListQuery } from './use-movie-list-query'
import { MovieListProps } from './movie-list.types'
import { PosterCard } from '../poster-card'

import { tmdbImage } from '@/utils/tmdb/image'
import { useLanguage } from '@/context/language'

export const MovieList = ({ variant }: MovieListProps) => {
  const { language } = useLanguage()
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
        <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-6">
          {flatData.map((movie) => (
            <Link href={`/${language}/movies/${movie.id}`} key={movie.id}>
              <PosterCard.Root>
                <PosterCard.Image
                  src={tmdbImage(movie.poster_path, 'w500')}
                  alt={movie.title}
                />

                <PosterCard.Details>
                  <PosterCard.Title>{movie.title}</PosterCard.Title>
                  <PosterCard.Year>
                    {movie.release_date.split('-')[0]}
                  </PosterCard.Year>
                </PosterCard.Details>
              </PosterCard.Root>
            </Link>
          ))}

          {!isLastPage && (
            <>
              <PosterCard.Skeleton ref={ref} />
              <PosterCard.Skeleton />
              <PosterCard.Skeleton />
            </>
          )}
        </div>
      </div>
    </>
  )
}
