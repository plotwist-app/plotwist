'use client'

import { ReactNode, createContext, useEffect } from 'react'
import * as NProgress from 'nprogress'
import { usePathname, useRouter } from 'next/navigation'
import NextTopLoader from 'nextjs-toploader'

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
      <NextTopLoader color="#ccc" showSpinner={false} />
      {children}
    </AppContext.Provider>
  )
}
