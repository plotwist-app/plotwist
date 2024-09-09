import { ComponentProps, forwardRef } from 'react'
import NextImage, { ImageProps } from 'next/image'
import { Skeleton } from '@plotwist/ui/components/ui/skeleton'

const Root = forwardRef<HTMLDivElement, ComponentProps<'div'>>((props, ref) => {
  return <div className="space-y-2" {...props} ref={ref} />
})
Root.displayName = 'Root'

const Image = (props: ImageProps) => {
  return (
    <div className="relative aspect-poster w-full overflow-hidden rounded-lg border bg-muted shadow">
      <NextImage {...props} fill />
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
