import { axiosClient } from '..'
import { Language } from '../models/language'
import {
  GetAvailableRegionsResponse,
  GetWatchProvidersResponse,
  WatchProviders,
} from '../models/watch-providers'

/*
|-----------------------------------------------------------------------------
| Watch providers
| 
| References:
| 1. https://developer.themoviedb.org/reference/watch-provider-tv-list
| 2. https://developer.themoviedb.org/reference/watch-providers-movie-list
| 
|-----------------------------------------------------------------------------
*/

type WatchProvidersQueryParams = {
  language: Language
  watch_region?: string
}

const list = async (
  type: 'tv' | 'movie',
  params: WatchProvidersQueryParams,
) => {
  const { data } = await axiosClient.get<GetWatchProvidersResponse>(
    `/watch/providers/${type}`,
    {
      params,
    },
  )

  return data.results
}

/*
|-----------------------------------------------------------------------------
| Available Regions
| 
| References:
| https://developer.themoviedb.org/reference/watch-providers-available-regions
| 
|-----------------------------------------------------------------------------
*/

type AvailableRegionsQueryParams = {
  language: Language
}

const regions = async (params: AvailableRegionsQueryParams) => {
  const { data } = await axiosClient.get<GetAvailableRegionsResponse>(
    '/watch/providers/regions',
    {
      params,
    },
  )

  console.log({ data })

  return data.results
}

/*
|-----------------------------------------------------------------------------
| Item watch providers
| 
|  References:
|  1. https://developer.themoviedb.org/reference/movie-watch-providers
|  2. https://developer.themoviedb.org/reference/tv-series-watch-providers  
|
|-----------------------------------------------------------------------------
*/

const item = async (type: 'tv' | 'movie', id: number) => {
  const { data } = await axiosClient.get<WatchProviders>(
    `/${type}/${id}/watch/providers`,
  )

  return data
}

export const watchProviders = { list, item, regions }
