import { Language } from '../models/language'
import { axiosClient } from '../index'
import { TvSerie, TvSerieDetails } from '../models/tv-series'
import { ListResponse } from '../utils/list-response'

/*
|-----------------------------------------------------------------------------
| Details
| 
| References:
| https://developer.themoviedb.org/reference/tv-series-details
| 
|-----------------------------------------------------------------------------
*/

const details = async (id: number, language: Language) => {
  const { data } = await axiosClient.get<TvSerieDetails>(`/tv/${id}`, {
    params: {
      language,
    },
  })

  return data
}

/*
|-----------------------------------------------------------------------------
| Discover
| 
| References:
| https://developer.themoviedb.org/reference/discover-tv
| 
|-----------------------------------------------------------------------------
*/

type DiscoverTvSeriesFilters = Partial<
  Record<
    | 'air_date.gte'
    | 'air_date.lte'
    | 'sort_by'
    | 'with_genres'
    | 'with_original_language'
    | 'with_keywords'
    | 'with_watch_providers'
    | 'watch_region'
    | 'vote_average.gte'
    | 'vote_average.lte'
    | 'vote_count.gte',
    string | null
  >
>

type DiscoverTvSeriesOptions = {
  language: Language
  page: number
  filters?: DiscoverTvSeriesFilters
}

export const discover = async (options: DiscoverTvSeriesOptions) => {
  const { page, language, filters } = options

  const { data } = await axiosClient.get<ListResponse<TvSerie>>(
    `/discover/tv`,
    {
      params: {
        page,
        language,
        ...filters,
      },
    },
  )

  return data
}

/*
|-----------------------------------------------------------------------------
| List
| 
| References:
| https://developer.themoviedb.org/reference/tv-series-airing-today-list
| https://developer.themoviedb.org/reference/tv-series-on-the-air-list
| https://developer.themoviedb.org/reference/tv-series-popular-list
| https://developer.themoviedb.org/reference/tv-series-top-rated-list
| 
|-----------------------------------------------------------------------------
*/

type TvSeriesListType = 'airing_today' | 'on_the_air' | 'popular' | 'top_rated'

type ListQueryParams = {
  list: TvSeriesListType
  language: Language
  page: number
}

const list = async (params: ListQueryParams) => {
  const { list, language, page } = params

  const { data } = await axiosClient.get<ListResponse<TvSerie>>(`/tv/${list}`, {
    params: {
      language,
      page,
    },
  })

  return data
}

/*
|-----------------------------------------------------------------------------
| Related
| 
| References:
| https://developer.themoviedb.org/reference/tv-series-recommendations
| https://developer.themoviedb.org/reference/tv-series-similar
| 
|-----------------------------------------------------------------------------
*/

const related = async (
  id: number,
  type: 'recommendations' | 'similar',
  language: Language,
) => {
  const { data } = await axiosClient.get<ListResponse<TvSerie>>(
    `/tv/${id}/${type}`,

    {
      params: {
        language,
      },
    },
  )

  return data
}

export const tv = { details, discover, list, related }
export { type TvSeriesListType }
