import { tmdb } from '@/services/tmdb'
import { ImagesMasonry } from './images-masonry'

type BaseImagesProps = {
  tmdbId: number
}

type DefaultImagesProps = BaseImagesProps & {
  variant: 'tv' | 'movie' | 'person'
}

type SeasonImagesProps = BaseImagesProps & {
  variant: 'season'
  seasonNumber: number
}

export type ImagesProps = DefaultImagesProps | SeasonImagesProps

function getImages(props: ImagesProps) {
  const { variant, tmdbId } = props

  if (variant === 'season') {
    const { seasonNumber } = props
    return tmdb.season.images(tmdbId, seasonNumber)
  }

  return tmdb.images(variant, tmdbId)
}

export const Images = async (props: ImagesProps) => {
  const { variant } = props
  const { backdrops, posters, profiles } = await getImages(props)

  const orderImages = () => {
    if (variant === 'person')
      return [...profiles].sort((a, b) => b.vote_count - a.vote_count)

    if (variant === 'season')
      return [...posters].sort((a, b) => b.vote_count - a.vote_count)

    return [...backdrops, ...posters].sort(
      (a, b) => b.vote_count - a.vote_count
    )
  }

  return <ImagesMasonry images={orderImages()} />
}
