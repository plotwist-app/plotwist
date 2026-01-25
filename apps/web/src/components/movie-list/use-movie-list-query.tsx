import { useInfiniteQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { useLanguage } from '@/context/language'
import { useUserPreferences } from '@/context/user-preferences'
import { type DiscoverMovieFilters, tmdb } from '@/services/tmdb'
import type { MovieListVariant } from './movie-list.types'

const INITIAL_PAGE = 1
const MINIMUM_VOTE_COUNT = 200

function getDateRange(variant: 'now_playing' | 'upcoming'): {
  minDate: string
  maxDate: string
} {
  const today = new Date()

  if (variant === 'now_playing') {
    const minDate = new Date(today)
    minDate.setMonth(today.getMonth() - 2)

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
  variant: MovieListVariant
): Partial<DiscoverMovieFilters> {
  switch (variant) {
    case 'now_playing': {
      const { minDate, maxDate } = getDateRange('now_playing')

      return {
        'release_date.gte': minDate,
        'release_date.lte': maxDate,
        with_release_type: '2|3',
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
        without_genres: '99,10755',
        'vote_count.gte': MINIMUM_VOTE_COUNT.toString(),
      }
    case 'upcoming': {
      const { minDate, maxDate } = getDateRange('upcoming')
      return {
        'release_date.gte': minDate,
        'release_date.lte': maxDate,
        with_release_type: '2|3',
        sort_by: 'popularity.desc',
      }
    }
    default:
      return {}
  }
}

export const useMovieListQuery = (variant: MovieListVariant) => {
  const { language } = useLanguage()
  const searchParams = useSearchParams()
  const { userPreferences, formatWatchProvidersIds } = useUserPreferences()

  const with_watch_providers = userPreferences?.watchProvidersIds
    ? formatWatchProvidersIds(userPreferences.watchProvidersIds)
    : searchParams.get('with_watch_providers')

  const watch_region =
    userPreferences?.watchRegion ?? searchParams.get('watch_region')

  const variantFilters = getVariantFilters(variant)
  const filters: DiscoverMovieFilters = {
    ...variantFilters,
    with_genres: searchParams.get('genres'),
    'release_date.gte':
      variantFilters['release_date.gte'] ??
      searchParams.get('release_date.gte'),
    'release_date.lte':
      variantFilters['release_date.lte'] ??
      searchParams.get('release_date.lte'),
    with_original_language: searchParams.get('with_original_language'),
    sort_by: variantFilters.sort_by ?? searchParams.get('sort_by'),
    with_watch_providers,
    watch_region,
    'vote_average.gte': searchParams.get('vote_average.gte'),
    'vote_average.lte': searchParams.get('vote_average.lte'),
    'vote_count.gte':
      variantFilters['vote_count.gte'] ?? searchParams.get('vote_count.gte'),
    without_genres: variantFilters.without_genres,
    with_release_type: variantFilters.with_release_type,
  }

  return useInfiniteQuery({
    queryKey: [variant, language, ...Object.values(filters)],
    queryFn: ({ pageParam }) =>
      tmdb.movies.discover({ filters, language, page: pageParam }),
    getNextPageParam: lastPage => lastPage.page + 1,
    initialPageParam: INITIAL_PAGE,
  })
}
