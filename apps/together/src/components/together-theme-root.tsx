'use client'

import { useSearchParams } from 'next/navigation'
import { type ReactNode, Suspense } from 'react'

export type TogetherTheme = 'violet' | 'butter' | 'coral'

function isTheme(value: string | null): value is TogetherTheme {
  return value === 'violet' || value === 'butter' || value === 'coral'
}

function TogetherThemeInner({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams()
  const queryTheme = searchParams.get('theme')
  const theme = isTheme(queryTheme) ? queryTheme : 'coral'

  return (
    <div className="together-shell" data-together-theme={theme}>
      {children}
    </div>
  )
}

export function TogetherThemeRoot({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="together-shell" data-together-theme="coral">
          {children}
        </div>
      }
    >
      <TogetherThemeInner>{children}</TogetherThemeInner>
    </Suspense>
  )
}
