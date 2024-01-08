'use client'

import { ReactNode, createContext, useEffect } from 'react'
import * as NProgress from 'nprogress'
import { usePathname, useRouter } from 'next/navigation'
import NextTopLoader from 'nextjs-toploader'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export const APP_QUERY_CLIENT = new QueryClient()

type AppContextProviderProps = {
  children: ReactNode
}

export const AppContext = createContext({})

export const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    NProgress.done()
  }, [pathname, router])

  return (
    <AppContext.Provider value={{}}>
      <QueryClientProvider client={APP_QUERY_CLIENT}>
        <NextTopLoader color="#ccc" showSpinner={false} />
        {children}
      </QueryClientProvider>
    </AppContext.Provider>
  )
}
