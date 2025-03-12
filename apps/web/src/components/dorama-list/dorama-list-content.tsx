'use client'

import { tmdb } from '@/services/tmdb'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

import { useLanguage } from '@/context/language'
import { useUserPreferences } from '@/context/user-preferences'
import { tmdbImage } from '@/utils/tmdb/image'
import { Link } from 'next-view-transitions'
import { v4 } from 'uuid'
import { PosterCard } from '../poster-card'

export const DoramaListContent = () => {
  const { language } = useLanguage()
  const { userPreferences, formatWatchProvidersIds } = useUserPreferences()

  const { ref, inView } = useInView({
    threshold: 0,
  })

  const { data, fetchNextPage } = useInfiniteQuery({
    queryKey: ['doramas', language, userPreferences],
    queryFn: async ({ pageParam }) => {
      const filters = {
        language,
        page: pageParam,
        filters: {
          with_genres: '18',
          with_origin_country: 'KR',
          watch_region: userPreferences?.watchRegion,
          with_watch_providers: formatWatchProvidersIds(
            userPreferences?.watchProvidersIds ?? []
          ),
        },
      } as const

      return await tmdb.tv.discover(filters)
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

  const flatData = data.pages
    .flatMap(page => page.results)
    .filter(result => result.backdrop_path)

  const isLastPage =
    data.pages[data.pages.length - 1].page >=
    data.pages[data.pages.length - 1].total_pages

  return (
    <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
      {flatData.map(item => {
        return (
          <Link href={`/${language}/tv-series/${item.id}`} key={item.id}>
            <PosterCard.Root>
              <PosterCard.Image
                src={tmdbImage(item.poster_path, 'w500')}
                alt={item.name}
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
