import { cn } from '@/lib/utils'
import { ComponentProps } from 'react'

type ProBadgeProps = ComponentProps<'span'>

export const ProBadge = ({ className, ...props }: ProBadgeProps) => {
  return (
    <span
      className={cn(
        'animate-shine rounded-full border bg-[linear-gradient(110deg,#ffffff,45%,#f1f1f1,55%,#ffffff)] bg-[length:200%_100%] px-2 py-[1px] text-[10px] text-foreground dark:bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] dark:text-white',
        className,
      )}
      {...props}
    >
      PRO
    </span>
  )
}
