'use client'

import { Link } from 'next-view-transitions'
import { useLanguage } from '@/context/language'
import { cn } from '@/lib/utils'

type ProBadgeProps = { className?: string; isLink?: boolean }

export const ProBadge = ({ className, isLink }: ProBadgeProps) => {
  const { language } = useLanguage()

  if (isLink) {
    return (
      <Link
        href={`/${language}#pricing`}
        className={cn(
          'animate-shine rounded-md border bg-[linear-gradient(110deg,#ffffff,45%,#f1f1f1,55%,#ffffff)] bg-[length:200%_100%] px-2.5 py-0.5 text-xs text-foreground dark:bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] dark:text-white font-semibold',
          className
        )}
      >
        PRO
      </Link>
    )
  }

  return (
    <div
      className={cn(
        'animate-shine rounded-md border bg-[linear-gradient(110deg,#ffffff,45%,#f1f1f1,55%,#ffffff)] bg-[length:200%_100%] px-2.5 py-0.5 text-xs text-foreground dark:bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] dark:text-white font-semibold',
        className
      )}
    >
      PRO
    </div>
  )
}
