import { Language } from '@/types/languages'
import { tmdbClient } from '../..'

type AvailableRegionsQueryParams = {
  language: Language
}

type AvailableRegion = {
  english_name: string
  iso_3166_1: string
  native_name: string
}

type AvailableRegionsResponse = {
  results: AvailableRegion[]
}

export const availableRegions = async (params: AvailableRegionsQueryParams) => {
  const { data } = await tmdbClient.get<AvailableRegionsResponse>(
    '/watch/providers/regions',
    {
      params,
    },
  )

  return data.results
}
