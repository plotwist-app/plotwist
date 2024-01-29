import { tmdbClient } from '../..'
import { Images } from './images.types'

type Variant = 'movie' | 'tv' | 'person'

export const images = async (variant: Variant, id: number) => {
  const { data } = await tmdbClient.get<Images>(`/${variant}/${id}/images`)

  return data
}
