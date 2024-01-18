'use client'

import { ReactNode, createContext, useContext } from 'react'
import { Language } from '@/types/languages'

type LanguageContextProviderProps = {
  children: ReactNode
  language: Language
}

type LanguageContextType = {
  language: Language
}

export const languageContext = createContext({} as LanguageContextType)

export const LanguageContextProvider = ({
  children,
  language,
}: LanguageContextProviderProps) => {
  return (
    <languageContext.Provider value={{ language }}>
      {children}
    </languageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(languageContext)

  if (!context) {
    throw new Error(
      'LanguageContext must be used within LanguageContextProvider',
    )
  }

  return context
}
