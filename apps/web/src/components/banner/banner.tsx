import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'

type BannerProps = {
  url?: string
  initial?: boolean
} & ComponentProps<'div'>

export const Banner = ({ initial, url, className, ...props }: BannerProps) => {
  return (
    <div
      {...props}
      className={cn(
        'h-[30dvh] w-full overflow-hidden border bg-muted shadow md:rounded-lg lg:h-[55dvh]',
        className,
      )}
    >
      <div
        style={{
          backgroundImage: `url('${url}')`,
          backgroundSize: initial ? 'initial' : 'contain',
        }}
        className="h-full w-full brightness-50"
        data-testid="banner"
      />
    </div>
  )
}
