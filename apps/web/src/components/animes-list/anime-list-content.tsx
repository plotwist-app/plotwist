'use client'

import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Movie, TvSerie, tmdb } from '@plotwist/tmdb'

import { TvSerieCard } from '../tv-serie-card'
import { MovieCard, MovieCardSkeleton } from '../movie-card'
import { MovieListSkeleton } from '../movie-list/movie-list-skeleton'

import { AnimeListType } from '.'
import { useLanguage } from '@/context/language'

type AnimeListContentProps = { type: AnimeListType }

export const AnimeListContent = ({ type }: AnimeListContentProps) => {
  const { language } = useLanguage()

  const { ref, inView } = useInView({
    threshold: 0,
  })

  const { data, fetchNextPage } = useInfiniteQuery({
    queryKey: ['animes', type],
    queryFn: async ({ pageParam }) => {
      if (type === 'tv') {
        return await tmdb.tv.discover({
          language,
          page: pageParam,
          filters: { with_keywords: '210024', sort_by: 'vote_count.desc' },
        })
      }

      return await tmdb.movies.discover({
        language,
        page: pageParam,
        filters: { with_keywords: '210024', sort_by: 'vote_count.desc' },
      })
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.page + 1,
  })

  useEffect(() => {
    if (inView) fetchNextPage()
  }, [fetchNextPage, inView])

  if (!data) return <MovieListSkeleton />

  const flatData = data.pages.flatMap(
    (page) => page.results as unknown as TvSerie | Movie,
  )

  const isLastPage =
    data.pages[data.pages.length - 1].page >=
    data.pages[data.pages.length - 1].total_pages

  return (
    <div className="rid-cols-1 grid gap-x-4 gap-y-8 md:grid-cols-3">
      {flatData.map((item) => {
        if (type === 'tv') {
          return <TvSerieCard tvSerie={item as TvSerie} key={item.id} />
        }

        return <MovieCard movie={item as Movie} key={item.id} />
      })}

      {!isLastPage && (
        <>
          <MovieCardSkeleton ref={ref} />
          <MovieCardSkeleton />
          <MovieCardSkeleton />
        </>
      )}
    </div>
  )
}
