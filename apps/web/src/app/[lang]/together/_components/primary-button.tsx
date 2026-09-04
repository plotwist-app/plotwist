'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
}

export function PrimaryButton({
  className,
  children,
  type = 'button',
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'together-btn-primary together-label h-[52px] w-full rounded-full transition-transform active:scale-[0.98] disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
