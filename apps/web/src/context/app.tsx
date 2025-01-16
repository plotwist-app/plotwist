'use client'

import { usePathname, useRouter } from 'next/navigation'
import NextTopLoader from 'nextjs-toploader'
import * as NProgress from 'nprogress'
import { type ReactNode, useEffect } from 'react'
export * from '@/components/providers'

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
    <>
      <NextTopLoader color="#ccc" showSpinner={false} />
      {children}
    </>
  )
}
