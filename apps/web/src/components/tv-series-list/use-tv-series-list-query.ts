import { useLanguage } from '@/context/language'
import { useUserPreferences } from '@/context/user-preferences'
import { type DiscoverTvSeriesFilters, tmdb } from '@/services/tmdb'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import type { TvSeriesListVariant } from './tv-series-list.types'

const INITIAL_PAGE = 1
const MINIMUM_VOTE_COUNT = 200

function getDateRange(variant: 'airing_today' | 'upcoming'): {
  minDate: string
  maxDate: string
} {
  const today = new Date()

  if (variant === 'airing_today') {
    const minDate = new Date(today)
    minDate.setMonth(today.getMonth() - 1)

    const maxDate = new Date(today)
    maxDate.setMonth(today.getMonth() + 1)

    return {
      minDate: minDate.toISOString().split('T')[0],
      maxDate: maxDate.toISOString().split('T')[0],
    }
  }

  const minDate = new Date(today)
  const maxDate = new Date(today)
  maxDate.setMonth(today.getMonth() + 6)
  return {
    minDate: minDate.toISOString().split('T')[0],
    maxDate: maxDate.toISOString().split('T')[0],
  }
}

function getVariantFilters(
  variant: TvSeriesListVariant
): Partial<DiscoverTvSeriesFilters> {
  switch (variant) {
    case 'airing_today': {
      const { minDate, maxDate } = getDateRange('airing_today')
      return {
        'air_date.gte': minDate,
        'air_date.lte': maxDate,
        sort_by: 'popularity.desc',
      }
    }
    case 'popular':
      return {
        sort_by: 'popularity.desc',
      }
    case 'top_rated':
      return {
        sort_by: 'vote_average.desc',
        'vote_count.gte': MINIMUM_VOTE_COUNT.toString(),
      }
    case 'on_the_air': {
      const { minDate, maxDate } = getDateRange('upcoming')
      return {
        'air_date.gte': minDate,
        'air_date.lte': maxDate,
        sort_by: 'popularity.desc',
      }
    }
    default:
      return {}
  }
}

export const useTvSeriesListQuery = (variant: TvSeriesListVariant) => {
  const { language } = useLanguage()
  const searchParams = useSearchParams()
  const { userPreferences, formatWatchProvidersIds } = useUserPreferences()

  const with_watch_providers = userPreferences?.watchProvidersIds
    ? formatWatchProvidersIds(userPreferences.watchProvidersIds)
    : searchParams.get('with_watch_providers')

  const watch_region =
    userPreferences?.watchRegion ?? searchParams.get('watch_region')

  const variantFilters = getVariantFilters(variant)
  const filters: DiscoverTvSeriesFilters = {
    ...variantFilters,
    with_genres: searchParams.get('genres'),
    'air_date.gte':
      variantFilters['air_date.gte'] ?? searchParams.get('air_date.gte'),
    'air_date.lte':
      variantFilters['air_date.lte'] ?? searchParams.get('air_date.lte'),
    with_original_language: searchParams.get('with_original_language'),
    sort_by: variantFilters.sort_by ?? searchParams.get('sort_by'),
    with_watch_providers,
    watch_region,
    'vote_average.gte': searchParams.get('vote_average.gte'),
    'vote_average.lte': searchParams.get('vote_average.lte'),
    'vote_count.gte':
      variantFilters['vote_count.gte'] ?? searchParams.get('vote_count.gte'),
  }

  return useInfiniteQuery({
    queryKey: [variant, language, ...Object.values(filters)],
    queryFn: ({ pageParam }) =>
      tmdb.tv.discover({
        language,
        page: pageParam,
        filters,
      }),
    getNextPageParam: lastPage => lastPage.page + 1,
    initialPageParam: INITIAL_PAGE,
  })
}
