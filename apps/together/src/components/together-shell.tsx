'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function TogetherShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'mx-auto flex min-h-dvh w-full max-w-[420px] flex-col px-5 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]',
        className
      )}
    >
      {children}
    </div>
  )
}
