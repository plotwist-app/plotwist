'use client'

import { createContext, useContext } from 'react'
import { AuthContext, AuthContextProviderProps } from './auth.types'

export const authContext = createContext({} as AuthContext)

export const AuthContextProvider = ({
  children,
  user,
}: AuthContextProviderProps) => {
  return (
    <authContext.Provider value={{ user }}>{children}</authContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(authContext)

  if (!context) {
    throw new Error('ListsContext must be used within ListsContextProvider')
  }

  return context
}
