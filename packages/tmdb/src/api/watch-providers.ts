import axios from 'axios'

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

export const watchProviders = async (
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

export const availableRegions = async (params: AvailableRegionsQueryParams) => {
  const { data } = await axios.get<GetAvailableRegionsResponse>(
    '/watch/providers/regions',
    {
      params,
    },
  )

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

export const itemWatchProviders = async (type: 'tv' | 'movie', id: number) => {
  const { data } = await axiosClient.get<WatchProviders>(
    `/${type}/${id}/watch/providers`,
  )

  return data
}
