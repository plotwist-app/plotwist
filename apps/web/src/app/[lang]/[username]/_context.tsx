'use client'

import React, { createContext, useContext } from 'react'

interface LayoutContextProps {
  userId: string
}

const LayoutContext = createContext<LayoutContextProps | undefined>(undefined)

export const LayoutProvider = ({
  children,
  userId,
}: {
  children: React.ReactNode
  userId: string
}) => {
  return (
    <LayoutContext.Provider value={{ userId }}>
      {children}
    </LayoutContext.Provider>
  )
}

export const useLayoutContext = () => {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error(
      'useLayoutContext deve ser usado dentro de um LayoutProvider',
    )
  }
  return context
}
