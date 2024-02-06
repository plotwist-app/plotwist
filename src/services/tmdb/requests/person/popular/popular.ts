import { tmdbClient } from '@/services/tmdb'
import { Language } from '@/types/languages'
import { PopularPeopleResponse } from './popular.types'

export const popular = async (language: Language) => {
  const { data } = await tmdbClient.get<PopularPeopleResponse>(
    '/person/popular',
    {
      params: {
        language,
      },
    },
  )

  return data
}
