'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'

const client = new QueryClient()

export const SidebarSearchProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
