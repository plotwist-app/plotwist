import { tmdbClient } from '../..'
import { Videos } from './videos.types'

type Variant = 'movie' | 'tv'

export const videos = async (variant: Variant, id: number) => {
  const { data } = await tmdbClient.get<Videos>(`/${variant}/${id}/videos`)

  return data
}
