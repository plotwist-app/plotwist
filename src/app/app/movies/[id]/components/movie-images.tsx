import { TMDB } from '@/services/TMDB'
import { tmdbImage } from '@/utils/tmdb/image'
import Image from 'next/image'
import { Image as ImageTMDB } from 'tmdb-ts'

type MovieImagesProps = {
  movieId: number
}

type MovieImagesContentProps = {
  backdrops: ImageTMDB[]
}

export const MovieImagesContent = ({ backdrops }: MovieImagesContentProps) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      {backdrops.map(({ file_path: filePath }) => {
        const previewURL = tmdbImage(filePath, 'w500')
        const qualityURL = tmdbImage(filePath, 'original')

        return (
          <a
            className="relative aspect-video w-full overflow-hidden rounded-md border bg-background/50 shadow"
            target="_blank"
            href={qualityURL}
            key={filePath}
            data-testid="movie-image"
          >
            <Image
              fill
              className="object-cover"
              src={previewURL}
              alt={filePath}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </a>
        )
      })}
    </div>
  )
}

export const MovieImages = async ({ movieId }: MovieImagesProps) => {
  const { backdrops } = await TMDB.movies.images(movieId)

  return <MovieImagesContent backdrops={backdrops} />
}
