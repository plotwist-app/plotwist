import { tmdbClient } from '../..'
import { Images } from './images.types'

type Variant = 'movie' | 'tv'

export const images = async (variant: Variant, id: number) => {
  const { data } = await tmdbClient.get<Images>(`/${variant}/${id}/images`)

  console.log({ data })

  return data
}
