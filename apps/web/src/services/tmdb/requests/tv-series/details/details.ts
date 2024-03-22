import { tmdbClient } from '@/services/tmdb'
import { Language } from '@/types/languages'
import { TvSeriesDetails } from './details.types'

export const details = async (id: number, language: Language) => {
  const { data } = await tmdbClient.get<TvSeriesDetails>(`/tv/${id}`, {
    params: {
      language,
    },
  })

  return data
}
