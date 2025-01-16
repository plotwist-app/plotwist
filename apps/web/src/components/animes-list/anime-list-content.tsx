'use client'

import { type Movie, type TvSerie, tmdb } from '@/services/tmdb'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

import { useLanguage } from '@/context/language'
import { tmdbImage } from '@/utils/tmdb/image'
import Link from 'next/link'
import { v4 } from 'uuid'
import type { AnimeListType } from '.'
import { PosterCard } from '../poster-card'
import { useUserPreferences } from '@/context/user-preferences'

type AnimeListContentProps = { type: AnimeListType }

export const AnimeListContent = ({ type }: AnimeListContentProps) => {
  const { language, dictionary } = useLanguage()
  const { userPreferences, formatWatchProvidersIds } = useUserPreferences()

  const { ref, inView } = useInView({
    threshold: 0,
  })

  const { data, fetchNextPage } = useInfiniteQuery({
    queryKey: ['animes', type, language, userPreferences],
    queryFn: async ({ pageParam }) => {
      const query = {
        language,
        page: pageParam,
        filters: {
          with_keywords: '210024',
          watch_region: userPreferences?.watchRegion,
          with_watch_providers: formatWatchProvidersIds(
            userPreferences?.watchProvidersIds ?? []
          ),
        },
      } as const

      if (type === 'tv') {
        return await tmdb.tv.discover(query)
      }

      return await tmdb.movies.discover(query)
    },
    initialPageParam: 1,
    getNextPageParam: lastPage => lastPage.page + 1,
  })

  useEffect(() => {
    if (inView) fetchNextPage()
  }, [fetchNextPage, inView])

  if (!data)
    return (
      <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
        {Array.from({ length: 20 }).map(_ => (
          <PosterCard.Skeleton key={v4()} />
        ))}
      </div>
    )

  const flatData = data.pages.flatMap(
    page => page.results as unknown as TvSerie | Movie
  )

  const isLastPage =
    data.pages[data.pages.length - 1].page >=
    data.pages[data.pages.length - 1].total_pages

  return (
    <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
      {flatData.map(item => {
        if (type === 'tv') {
          const tv = item as TvSerie

          return (
            <Link href={`/${language}/tv-series/${tv.id}`} key={tv.id}>
              <PosterCard.Root>
                <PosterCard.Image
                  src={tmdbImage(tv.poster_path, 'w500')}
                  alt={tv.name}
                />
              </PosterCard.Root>
            </Link>
          )
        }

        const movie = item as Movie
        return (
          <Link href={`/${language}/movies/${movie.id}`} key={movie.id}>
            <PosterCard.Root>
              <PosterCard.Image
                src={tmdbImage(movie.poster_path, 'w500')}
                alt={movie.title}
              />
            </PosterCard.Root>
          </Link>
        )
      })}

      {!isLastPage && (
        <>
          <PosterCard.Skeleton ref={ref} />
          <PosterCard.Skeleton />
          <PosterCard.Skeleton />
        </>
      )}
    </div>
  )
}
