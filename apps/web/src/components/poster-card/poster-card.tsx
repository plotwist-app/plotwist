import { Skeleton } from '@plotwist/ui/components/ui/skeleton'
import NextImage, { type ImageProps } from 'next/image'
import { type ComponentProps, forwardRef } from 'react'
import { PosterFallback } from '@/components/poster-fallback'

const Root = forwardRef<HTMLDivElement, ComponentProps<'div'>>((props, ref) => {
  return <div className="space-y-2" {...props} ref={ref} />
})
Root.displayName = 'Root'

function hasValidPosterSrc(src: ImageProps['src']): boolean {
  if (!src) return false
  if (typeof src === 'string') {
    return !src.endsWith('/null') && !src.endsWith('/undefined') && !src.endsWith('/')
  }
  return true
}

const Image = (props: ImageProps) => {
  const valid = hasValidPosterSrc(props.src)

  return (
    <div className="relative aspect-poster w-full overflow-hidden rounded-lg border bg-muted shadow">
      {valid ? (
        <NextImage {...props} fill />
      ) : (
        <PosterFallback title={typeof props.alt === 'string' ? props.alt : undefined} />
      )}
    </div>
  )
}

const Details = (props: ComponentProps<'div'>) => {
  return <div className="flex flex-col gap-0" {...props} />
}

const Title = (props: ComponentProps<'h3'>) => {
  return <h3 className="line-clamp-1 text-sm" {...props} />
}

const Year = (props: ComponentProps<'span'>) => {
  return <span className="text-xs text-muted-foreground" {...props} />
}

const PosterCardSkeleton = forwardRef<HTMLDivElement>((_, ref) => (
  <Root ref={ref}>
    <Skeleton className="aspect-poster w-full" />
  </Root>
))
PosterCardSkeleton.displayName = 'Skeleton'

export const PosterCard = {
  Root,
  Image,
  Details,
  Title,
  Year,
  Skeleton: PosterCardSkeleton,
}
