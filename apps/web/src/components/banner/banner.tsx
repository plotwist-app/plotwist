import { cn } from '@/lib/utils'
import type { ComponentProps } from 'react'

type BannerProps = {
  url?: string
} & ComponentProps<'div'>

export const Banner = ({ url, className, ...props }: BannerProps) => {
  return (
    <div
      {...props}
      className={cn(
        'h-[30dvh] w-full overflow-hidden border md:rounded-lg lg:h-[55dvh]',
        !url && 'border-dashed bg-background',
        className
      )}
    >
      <div
        style={{
          backgroundImage: `url('${url}')`,
          backgroundSize: 'cover',
        }}
        className="h-full w-full"
        data-testid="banner"
      />
    </div>
  )
}
