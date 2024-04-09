import Image from 'next/image'
import { Image as LucideImage } from 'lucide-react'
import { tmdbImage } from '@/utils/tmdb/image'

type PosterProps = {
  url?: string
  alt: string
}

export const Poster = ({ url, alt }: PosterProps) => {
  return (
    <div className="relative flex aspect-poster w-full items-center justify-center overflow-hidden rounded-lg border text-muted shadow">
      {url ? (
        <Image
          fill
          className="object-fill"
          loading="lazy"
          sizes="100%"
          alt={alt}
          src={tmdbImage(url)}
        />
      ) : (
        <LucideImage size={24} />
      )}
    </div>
  )
}
