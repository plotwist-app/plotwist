import { useLanguage } from '@/context/language'
import { type DiscoverMovieFilters, tmdb } from '@/services/tmdb'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import type { MovieListVariant } from './movie-list.types'

const INITIAL_PAGE = 1

export const useMovieListQuery = (variant: MovieListVariant) => {
  const { language } = useLanguage()
  const searchParams = useSearchParams()

  const filters: DiscoverMovieFilters = {
    with_genres: searchParams.get('genres'),
    'release_date.gte': searchParams.get('release_date.gte'),
    'release_date.lte': searchParams.get('release_date.lte'),
    with_original_language: searchParams.get('with_original_language'),
    sort_by: searchParams.get('sort_by'),
    with_watch_providers: searchParams.get('with_watch_providers'),
    watch_region: searchParams.get('watch_region'),
    'vote_average.gte': searchParams.get('vote_average.gte'),
    'vote_average.lte': searchParams.get('vote_average.lte'),
    'vote_count.gte': searchParams.get('vote_count.gte'),
  }

  return useInfiniteQuery({
    queryKey: [variant, language, ...Object.values(filters)],

    queryFn: ({ pageParam }) =>
      variant === 'discover'
        ? tmdb.movies.discover({ filters, language, page: pageParam })
        : tmdb.movies.list({ language, list: variant, page: pageParam }),
    getNextPageParam: lastPage => lastPage.page + 1,
    initialPageParam: INITIAL_PAGE,
  })
}
