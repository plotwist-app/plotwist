import { Language } from '@/types/languages'

import { tmdbClient } from '@/services/tmdb2'
import { ListResponse, TvShow } from '@/services/tmdb2/types'

export type RelatedType = 'recommendations' | 'similar'
export type RelatedResponse = ListResponse<TvShow>

export const related = async (
  id: number,
  type: RelatedType,
  language: Language,
) => {
  const { data } = await tmdbClient.get<RelatedResponse>(
    `/tv/${id}/${type}`,

    {
      params: {
        language,
      },
    },
  )

  return data
}
