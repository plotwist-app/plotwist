import { tmdbClient } from '..'
import { Credits } from '../types'

type Variant = 'movie' | 'tv'

export const credits = async (variant: Variant, id: number) => {
  const { data } = await tmdbClient.get<Credits>(`/${variant}/${id}/credits`)

  return data
}
