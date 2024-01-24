import { Language } from '@/types/languages'

import { tmdbClient } from '@/services/tmdb2'
import { ListResponse, Movie } from '@/services/tmdb2/types'

export type RelatedType = 'recommendations' | 'similar'
export type RelatedResponse = ListResponse<Movie>

export const related = async (
  id: number,
  type: RelatedType,
  language: Language,
) => {
  const { data } = await tmdbClient.get<RelatedResponse>(
    `/movie/${id}/${type}`,

    {
      params: {
        language,
      },
    },
  )

  return data
}
