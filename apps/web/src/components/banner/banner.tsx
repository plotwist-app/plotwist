import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'

type BannerProps = {
  url?: string
} & ComponentProps<'div'>

export const Banner = ({ url, className, ...props }: BannerProps) => {
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
          backgroundSize: 'cover',
        }}
        className="h-full w-full"
        data-testid="banner"
      />
    </div>
  )
}
