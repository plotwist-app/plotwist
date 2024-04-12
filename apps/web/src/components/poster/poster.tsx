import Image from 'next/image'
import { Image as LucideImage } from 'lucide-react'
import { tmdbImage } from '@/utils/tmdb/image'
import { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

type PosterProps = {
  url?: string
  alt: string
} & ComponentProps<'div'>

export const Poster = ({ url, alt, className, ...props }: PosterProps) => {
  return (
    <div
      className={cn(
        'relative flex aspect-poster w-full items-center justify-center overflow-hidden rounded-lg border text-muted shadow',
        className,
      )}
      {...props}
    >
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
