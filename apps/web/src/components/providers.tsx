'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { usePathname, useRouter } from 'next/navigation'
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes'
import NextTopLoader from 'nextjs-toploader'
import nProgress from 'nprogress'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { useEffect } from 'react'
import { Toaster } from 'sonner'

const queryClient = new QueryClient()
export const APP_QUERY_CLIENT = queryClient

function ThemeToggleShortcut() {
  const { setTheme, resolvedTheme } = useTheme()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.code === 'KeyL') {
        e.preventDefault()
        setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setTheme, resolvedTheme])

  return null
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const pathname = usePathname()
  const router = useRouter()

  // biome-ignore lint/correctness/useExhaustiveDependencies: Complete progress bar when page navigation changes
  useEffect(() => {
    nProgress.done()
  }, [pathname, router])

  return (
    <NextThemesProvider {...props}>
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>
          <NextTopLoader color="#ccc" showSpinner={false} />
          <ThemeToggleShortcut />
          {children}
        </NuqsAdapter>
      </QueryClientProvider>
    </NextThemesProvider>
  )
}

export function SonnerProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme()

  return (
    <>
      <Toaster
        theme={theme as 'light' | 'dark' | 'system'}
        className="toaster group"
        toastOptions={{
          classNames: {
            toast:
              'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
            description: 'group-[.toast]:text-muted-foreground',
            actionButton:
              'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
            cancelButton:
              'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          },
        }}
      />
      {children}
    </>
  )
}
