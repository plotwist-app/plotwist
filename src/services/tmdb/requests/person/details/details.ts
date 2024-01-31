import { tmdbClient } from '@/services/tmdb'
import { Language } from '@/types/languages'
import { DetailedPerson } from '.'

export const details = async (personId: number, language: Language) => {
  const { data } = await tmdbClient.get<DetailedPerson>(`/person/${personId}`, {
    params: {
      language,
    },
  })

  return data
}
