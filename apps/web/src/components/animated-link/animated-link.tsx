import { cn } from '@/lib/utils'
import Link from 'next/link'

interface AnimatedLinkProps extends React.ComponentProps<'div'> {
  href: string
  children: React.ReactNode
}

export const AnimatedLink = ({
  href,
  className,
  children,
  ...props
}: AnimatedLinkProps) => {
  return (
    <div
      {...props}
      className={cn(
        className,
        'w-fit relative after:absolute after:bg-neutral-400 after:bottom-0 after:left-0 after:h-px after:w-full after:origin-bottom-right after:scale-x-0 hover:after:origin-bottom-left hover:after:scale-x-100 after:transition-transform after:ease-in-out after:duration-300',
      )}
    >
      <Link href={href} className="text-neutral-400">
        {children}
      </Link>
    </div>
  )
}
