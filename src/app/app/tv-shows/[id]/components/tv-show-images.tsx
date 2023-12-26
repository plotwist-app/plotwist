import { TMDB } from '@/services/TMDB'
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
      {backdrops.map((backdrop) => {
        const previewURL = `https://image.tmdb.org/t/p/w500/${backdrop.file_path}`

        const qualityURL = `https://image.tmdb.org/t/p/original/${backdrop.file_path}`

        return (
          <a
            className="relative aspect-video w-full overflow-hidden rounded-md border bg-background/50 shadow"
            target="_blank"
            href={qualityURL}
            key={backdrop.file_path}
            data-testid="tv-show-image"
          >
            <Image
              fill
              className="object-cover"
              src={previewURL}
              alt={backdrop.file_path}
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
