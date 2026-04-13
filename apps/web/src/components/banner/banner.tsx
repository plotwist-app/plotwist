import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { PosterFallback } from '../poster-fallback'

type BannerProps = {
  url?: string
  posterUrl?: string
  title?: string
} & ComponentProps<'div'>

export const Banner = ({
  url,
  posterUrl,
  title,
  className,
  ...props
}: BannerProps) => {
  const backgroundUrl = url || posterUrl
  const isPosterAsFallback = !url && Boolean(posterUrl)

  return (
    <div
      {...props}
      className={cn(
        'relative w-full overflow-hidden md:rounded-lg aspect-banner border-b lg:border max-h-[55dvh]',
        !backgroundUrl && 'border-dashed bg-background',
        className
      )}
    >
      {backgroundUrl ? (
        <>
          <div
            style={{
              backgroundImage: `url('${backgroundUrl}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            className={cn(
              'h-full w-full',
              isPosterAsFallback && 'scale-110 blur-md brightness-75'
            )}
          />

          {isPosterAsFallback && (
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background/40" />
          )}
        </>
      ) : (
        <PosterFallback
          title={title}
          className="relative h-full bg-gradient-to-b from-muted to-background"
        />
      )}
    </div>
  )
}
