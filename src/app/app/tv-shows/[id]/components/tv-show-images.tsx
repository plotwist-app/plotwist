import { TMDB } from '@/services/TMDB'
import { tmdbImage } from '@/utils/tmdb/image'
import Image from 'next/image'
import { Image as ImageTMDB } from 'tmdb-ts'

type TvShowImagesProps = {
  tvShowID: number
}

type TvShowImagesContentProps = {
  backdrops: ImageTMDB[]
}

export const TvShowImagesContent = ({
  backdrops,
}: TvShowImagesContentProps) => {
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
            data-testid="tv-show-image"
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

export const TvShowImages = async ({ tvShowID }: TvShowImagesProps) => {
  const { backdrops } = await TMDB.tvShows.images(tvShowID)

  return <TvShowImagesContent backdrops={backdrops} />
}
