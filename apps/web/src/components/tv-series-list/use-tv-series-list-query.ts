import { useLanguage } from '@/context/language'
import { type DiscoverTvSeriesFilters, tmdb } from '@/services/tmdb'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'

import type { TvSeriesListVariant } from './tv-series-list.types'

const INITIAL_PAGE = 1

export const useTvSeriesListQuery = (variant: TvSeriesListVariant) => {
  const { language } = useLanguage()
  const searchParams = useSearchParams()

  const filters: DiscoverTvSeriesFilters = {
    with_genres: searchParams.get('genres'),
    'air_date.gte': searchParams.get('air_date.gte'),
    'air_date.lte': searchParams.get('air_date.lte'),
    with_original_language: searchParams.get('with_original_language'),
    sort_by: searchParams.get('sort_by'),
    with_watch_providers: searchParams.get('with_watch_providers'),
    watch_region: searchParams.get('watch_region'),
    'vote_average.gte': searchParams.get('vote_average.gte'),
    'vote_average.lte': searchParams.get('vote_average.lte'),
    'vote_count.gte': searchParams.get('vote_count.gte'),
  }

  const getQueryFn = (page: number) => {
    if (variant === 'discover') {
      return tmdb.tv.discover({
        language,
        page,
        filters,
      })
    }

    return tmdb.tv.list({
      language,
      list: variant,
      page,
    })
  }

  return useInfiniteQuery({
    queryKey: [variant, language, ...Object.values(filters)],
    queryFn: ({ pageParam }) => getQueryFn(pageParam),
    getNextPageParam: lastPage => lastPage.page + 1,
    initialPageParam: INITIAL_PAGE,
  })
}
