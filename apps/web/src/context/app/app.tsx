'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { usePathname, useRouter } from 'next/navigation'
import NextTopLoader from 'nextjs-toploader'
import * as NProgress from 'nprogress'
import { type ReactNode, useEffect } from 'react'

export const APP_QUERY_CLIENT = new QueryClient()

type AppWrapperProps = {
  children: ReactNode
}

export const AppWrapper = ({ children }: AppWrapperProps) => {
  const pathname = usePathname()
  const router = useRouter()

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    NProgress.done()
  }, [pathname, router])

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      disableTransitionOnChange
    >
      <QueryClientProvider client={APP_QUERY_CLIENT}>
        <NextTopLoader color="#ccc" showSpinner={false} />
        {children}
      </QueryClientProvider>
    </NextThemesProvider>
  )
}
