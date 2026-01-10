'use client'

import { createContext, type ReactNode, useContext } from 'react'

type Mode = 'EDIT' | 'SHOW'

type ListModeContextProviderProps = {
  children: ReactNode
  mode: Mode
}

type ListModeContextType = Pick<ListModeContextProviderProps, 'mode'>

export const listModeContext = createContext({} as ListModeContextType)
export const ListModeContextProvider = ({
  children,
  mode,
}: ListModeContextProviderProps) => {
  return (
    <listModeContext.Provider value={{ mode }}>
      {children}
    </listModeContext.Provider>
  )
}

export const useListMode = () => {
  const context = useContext(listModeContext)

  if (!context) {
    throw new Error(
      'ListModeContext must be used within ListModeContextProvider'
    )
  }

  return context
}
