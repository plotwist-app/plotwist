import { Language } from '@/types/languages'

import { tmdbClient } from '@/services/tmdb'
import { ListResponse, TvSerie } from '@/services/tmdb/types'

export type RelatedType = 'recommendations' | 'similar'
export type RelatedResponse = ListResponse<TvSerie>

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
