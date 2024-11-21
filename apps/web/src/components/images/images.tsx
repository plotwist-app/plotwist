import { tmdb } from '@/services/tmdb'
import { ImagesMasonry } from './images-masonry'

export type ImagesProps = {
  tmdbId: number
  variant: 'tv' | 'movie' | 'person'
}

export const Images = async ({ tmdbId, variant }: ImagesProps) => {
  const { backdrops, posters, profiles } = await tmdb.images(variant, tmdbId)

  const images = () => {
    if (variant === 'person')
      return [...profiles].sort((a, b) => b.vote_count - a.vote_count)

    return [...backdrops, ...posters].sort(
      (a, b) => b.vote_count - a.vote_count
    )
  }

  return <ImagesMasonry images={images()} />
}
