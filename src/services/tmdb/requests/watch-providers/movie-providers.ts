import { Language } from '@/types/languages'
import { tmdbClient } from '../..'

type MovieProvidersQueryParams = {
  language: Language
  watch_region?: string
}

type MovieProvider = {
  display_priorities: Record<string, number>
  display_priority: number
  logo_path: string
  provider_name: string
  provider_id: number
}

type MovieProvidersResponse = {
  results: MovieProvider[]
}

export const movieProviders = async (params: MovieProvidersQueryParams) => {
  const { data } = await tmdbClient.get<MovieProvidersResponse>(
    '/watch/providers/movie',
    {
      params,
    },
  )

  return data.results
}

// Reference: https://developer.themoviedb.org/reference/watch-providers-movie-list
