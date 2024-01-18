import { Language } from '@/types/languages'
import { tmdbClient } from '..'
import { ListResponse, Movie } from '../types'

export type MovieRelatedType = 'recommendations' | 'similar'
export type MovieRelatedResponse = ListResponse<Movie>

export const movieRelated = async (
  id: number,
  type: MovieRelatedType,
  language: Language,
) => {
  const { data } = await tmdbClient.get<MovieRelatedResponse>(
    `/movie/${id}/${type}`,
    {
      params: {
        language,
      },
    },
  )

  return data
}
