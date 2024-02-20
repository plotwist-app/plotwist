import { Language } from '@/types/languages'
import { tmdbClient } from '../..'

type TvProvidersQueryParams = {
  language: Language
  watch_region?: string
}

type TvProvider = {
  display_priorities: Record<string, number>
  display_priority: number
  logo_path: string
  provider_name: string
  provider_id: number
}

type TvProvidersResponse = {
  results: TvProvider[]
}

export const tvProviders = async (params: TvProvidersQueryParams) => {
  const { data } = await tmdbClient.get<TvProvidersResponse>(
    '/watch/providers/tv',
    {
      params,
    },
  )

  return data.results
}

// Reference: https://developer.themoviedb.org/reference/watch-providers-movie-list
