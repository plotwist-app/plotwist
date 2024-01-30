import { Language } from '@/types/languages'
import { tmdbClient } from '..'
import { Credits } from '../types'

type Variant = 'movie' | 'tv'

export const credits = async (
  variant: Variant,
  id: number,
  language: Language,
) => {
  const { data } = await tmdbClient.get<Credits>(`/${variant}/${id}/credits`, {
    params: {
      language,
    },
  })

  return data
}
