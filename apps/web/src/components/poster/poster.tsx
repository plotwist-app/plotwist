import { cn } from '@/lib/utils'
import { tmdbImage } from '@/utils/tmdb/image'
import { Image as LucideImage } from 'lucide-react'
import Image from 'next/image'
import type { ComponentProps } from 'react'

type PosterProps = {
  url?: string
  alt: string
} & ComponentProps<'div'>

export const Poster = ({ url, alt, className, ...props }: PosterProps) => {
  return (
    <div
      className={cn(
        'relative flex aspect-poster w-full items-center justify-center overflow-hidden rounded-lg border bg-muted text-muted shadow',
        className
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
