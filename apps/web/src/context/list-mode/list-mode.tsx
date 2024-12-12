'use client'

import { type ReactNode, createContext, useContext, useState } from 'react'

type Mode = 'EDIT' | 'SHOW'

type ListModeContextProviderProps = {
  children: ReactNode
  mode: Mode
}

type ListModeContextType = Pick<ListModeContextProviderProps, 'mode'> & {
  setMode: (mode: Mode) => void
}

export const listModeContext = createContext({} as ListModeContextType)
export const ListModeContextProvider = ({
  children,
  mode: initialMode,
}: ListModeContextProviderProps) => {
  const [mode, setMode] = useState<Mode>(initialMode)

  return (
    <listModeContext.Provider value={{ mode, setMode }}>
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
