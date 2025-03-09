import { tmdb } from '@/services/tmdb'
import type { Dictionary } from '@/utils/dictionaries'
import { ImagesMasonry } from './images-masonry'

type BaseImagesProps = {
  tmdbId: number
  dictionary: Dictionary
}

type DefaultImagesProps = BaseImagesProps & {
  variant: 'tv' | 'movie' | 'person'
}

type SeasonImagesProps = BaseImagesProps & {
  variant: 'season'
  seasonNumber: number
}

type EpisodeImagesProps = BaseImagesProps & {
  variant: 'episode'
  seasonNumber: number
  episodeNumber: number
}

export type ImagesProps =
  | DefaultImagesProps
  | SeasonImagesProps
  | EpisodeImagesProps

function getImages(props: ImagesProps) {
  const { variant, tmdbId } = props

  if (variant === 'season') {
    const { seasonNumber } = props
    return tmdb.season.images(tmdbId, seasonNumber)
  }

  if (variant === 'episode') {
    const { seasonNumber, episodeNumber } = props
    return tmdb.episodes.images(tmdbId, seasonNumber, episodeNumber)
  }

  return tmdb.images(variant, tmdbId)
}

export const Images = async (props: ImagesProps) => {
  const { variant, dictionary } = props
  const { backdrops, posters, profiles, stills } = await getImages(props)

  const orderImages = () => {
    if (variant === 'person')
      return [...profiles].sort((a, b) => b.vote_count - a.vote_count)

    if (variant === 'season')
      return [...posters].sort((a, b) => b.vote_count - a.vote_count)

    if (variant === 'episode') {
      return [...stills].sort((a, b) => b.vote_count - a.vote_count)
    }

    return [...backdrops, ...posters].sort(
      (a, b) => b.vote_count - a.vote_count
    )
  }

  const images = orderImages()

  if (images.length === 0)
    return (
      <div className="text-center text-muted-foreground border border-dashed rounded-md p-8 text-sm">
        {dictionary.no_images_found}
      </div>
    )

  return <ImagesMasonry images={images} />
}
