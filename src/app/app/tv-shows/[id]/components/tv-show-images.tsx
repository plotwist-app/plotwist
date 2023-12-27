import { Masonry } from '@/app/app/components/masonry'
import { TMDB } from '@/services/TMDB'

type TvShowImagesProps = {
  tvShowID: number
}

export const TvShowImages = async ({ tvShowID }: TvShowImagesProps) => {
  const { backdrops, posters } = await TMDB.tvShows.images(tvShowID)

  const images = [...backdrops, ...posters].sort(
    (a, b) => b.vote_count - a.vote_count,
  )

  return <Masonry images={images} />
}
