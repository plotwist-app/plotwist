'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

import { PosterCard } from '../poster-card'
import type { MovieListProps } from './movie-list.types'
import { useMovieListQuery } from './use-movie-list-query'

import { useLanguage } from '@/context/language'
import { tmdbImage } from '@/utils/tmdb/image'
import { v4 } from 'uuid'

export const MovieList = ({ variant }: MovieListProps) => {
  const { language } = useLanguage()
  const { data, fetchNextPage } = useMovieListQuery(variant)
  const { ref, inView } = useInView({
    threshold: 0,
  })

  useEffect(() => {
    if (inView) fetchNextPage()
  }, [fetchNextPage, inView])

  if (!data)
    return (
      <div className="grid w-full grid-cols-3 gap-4 md:grid-cols-6">
        {Array.from({ length: 20 }).map(_ => (
          <PosterCard.Skeleton key={v4()} />
        ))}
      </div>
    )

  const flatData = data.pages.flatMap(page => page.results)
  const isLastPage =
    data.pages[data.pages.length - 1].page >=
    data.pages[data.pages.length - 1].total_pages

  return (
    <div className="flex items-center justify-between">
      <div className="grid w-full grid-cols-3 gap-4 md:grid-cols-6">
        {flatData.map(movie => (
          <Link href={`/${language}/movies/${movie.id}`} key={movie.id}>
            <PosterCard.Root>
              <PosterCard.Image
                src={tmdbImage(movie.poster_path, 'w500')}
                alt={movie.title}
              />
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
  )
}
