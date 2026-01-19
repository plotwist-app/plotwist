'use client'

import { createContext, type ReactNode, useContext } from 'react'
import { asLanguage, type Language } from '@/types/languages'
import type { Dictionary } from '@/utils/dictionaries'

type LanguageContextProviderProps = {
  children: ReactNode
  language: string
  dictionary: Dictionary
}

type LanguageContextType = {
  dictionary: Dictionary
  language: Language
}

export const languageContext = createContext({} as LanguageContextType)

export const LanguageContextProvider = ({
  children,
  language,
  dictionary,
}: LanguageContextProviderProps) => {
  const safeLanguage = asLanguage(language)

  return (
    <languageContext.Provider value={{ language: safeLanguage, dictionary }}>
      {children}
    </languageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(languageContext)

  if (!context) {
    throw new Error(
      'LanguageContext must be used within LanguageContextProvider'
    )
  }

  return context
}
