import { ImagesMasonry } from './images-masonry'
import { tmdb } from '@/services/tmdb2'

type ImagesProps = {
  tmdbId: number
  variant: 'tv' | 'movie'
}

export const Images = async ({ tmdbId, variant }: ImagesProps) => {
  const { backdrops, posters } = await tmdb.images(variant, tmdbId)

  const images = [...backdrops, ...posters].sort(
    (a, b) => b.vote_count - a.vote_count,
  )

  return <ImagesMasonry images={images} />
}
