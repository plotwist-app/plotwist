import { TMDB } from '@/services/TMDB'
import { ImagesMasonry } from './images-masonry'

type ImagesProps = {
  tmdbId: number
  variant: 'tvShows' | 'movies'
}

export const Images = async ({ tmdbId, variant }: ImagesProps) => {
  const { backdrops, posters } = await TMDB[variant].images(tmdbId)

  const images = [...backdrops, ...posters].sort(
    (a, b) => b.vote_count - a.vote_count,
  )

  return <ImagesMasonry images={images} />
}
