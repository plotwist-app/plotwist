import { tmdbClient } from '@/services/tmdb2'
import { Language } from '@/types/languages'
import { DetailedCollection } from './details.types'

export const details = async (id: number, language: Language) => {
  const { data } = await tmdbClient.get<DetailedCollection>(
    `/collection/${id}`,
    {
      params: {
        language,
      },
    },
  )

  return data
}
