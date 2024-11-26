'use client'

import { useLanguage } from '@/context/language'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { ComponentProps } from 'react'

type ProBadgeProps = { className?: string }

export const ProBadge = ({ className }: ProBadgeProps) => {
  const { language } = useLanguage()

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
