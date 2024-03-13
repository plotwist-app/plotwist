import { tmdbClient } from '@/services/tmdb'
import { ListResponse, TvSerie } from '@/services/tmdb/types'
import { DiscoverTvSeriesOptions } from '.'

export const discover = async (options: DiscoverTvSeriesOptions) => {
  const { page, language, filters } = options

  const { data } = await tmdbClient.get<ListResponse<TvSerie>>(`/discover/tv`, {
    params: {
      page,
      language,
      ...filters,
    },
  })

  return data
}
