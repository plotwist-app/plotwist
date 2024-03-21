'use client'

import { tmdb } from '@/services/tmdb'
import { Language } from '@/types/languages'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Badge } from '../ui/badge'
import { TvSerieCard } from '../tv-serie-card'
import { Movie, TvSerie } from '@/services/tmdb/types'
import { MovieCard, MovieCardSkeleton } from '../movie-card'
import { MovieListSkeleton } from '../movie-list/movie-list-skeleton'
import { useInView } from 'react-intersection-observer'
import { useLanguage } from '@/context/language'

type AnimeListProps = { language: Language }

export const AnimeList = ({ language }: AnimeListProps) => {
  const { dictionary } = useLanguage()
  const [mode, setMode] = useState<'TV_SERIES' | 'MOVIES'>('TV_SERIES')

  const { ref, inView } = useInView({
    threshold: 0,
  })

  const { data, fetchNextPage } = useInfiniteQuery({
    queryKey: ['animes', mode],
    queryFn: async ({ pageParam }) => {
      if (mode === 'TV_SERIES') {
        return await tmdb.tvSeries.discover({
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
    <div className="space-y-4">
      <div className="flex gap-2">
        <Badge
          onClick={() => setMode('TV_SERIES')}
          className="cursor-pointer"
          variant={mode === 'TV_SERIES' ? 'default' : 'outline'}
        >
          {dictionary.animes_page.button_tv_series}
        </Badge>
        <Badge
          onClick={() => setMode('MOVIES')}
          className="cursor-pointer"
          variant={mode === 'MOVIES' ? 'default' : 'outline'}
        >
          {dictionary.animes_page.button_movies}
        </Badge>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {flatData.map((item) => {
          if (mode === 'TV_SERIES') {
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
    </div>
  )
}
