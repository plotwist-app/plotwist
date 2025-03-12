'use client'

import type { GetUserPreferences200 } from '@/api/endpoints.schemas'
import { type ReactNode, createContext, useContext } from 'react'

export type UserPreferencesContextType = {
  userPreferences: GetUserPreferences200['userPreferences'] | undefined
  formatWatchProvidersIds: (watchProvidersIds: number[]) => string
}

export type UserPreferencesContextProviderProps = {
  children: ReactNode
} & Pick<UserPreferencesContextType, 'userPreferences'>

export const UserPreferencesContext = createContext(
  {} as UserPreferencesContextType | undefined
)

export const UserPreferencesContextProvider = ({
  children,
  userPreferences,
}: UserPreferencesContextProviderProps) => {
  const formatWatchProvidersIds = (watchProvidersIds: number[]) => {
    return watchProvidersIds.join('|')
  }

  return (
    <UserPreferencesContext.Provider
      value={{ userPreferences, formatWatchProvidersIds }}
    >
      {children}
    </UserPreferencesContext.Provider>
  )
}

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext)

  if (!context) {
    throw new Error(
      'UserPreferencesContext must be used within UserPreferencesContextProvider'
    )
  }

  return context
}
