import { Masonry } from '@/components/masonry'
import { TMDB } from '@/services/TMDB'

type MovieImagesProps = {
  movieId: number
}

export const MovieImages = async ({ movieId }: MovieImagesProps) => {
  const { backdrops, posters } = await TMDB.movies.images(movieId)

  const images = [...backdrops, ...posters].sort(
    (a, b) => b.vote_count - a.vote_count,
  )

  return <Masonry images={images} />
}
