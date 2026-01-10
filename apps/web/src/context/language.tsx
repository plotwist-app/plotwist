'use client'

import { createContext, type ReactNode, useContext } from 'react'
import type { Language } from '@/types/languages'
import type { Dictionary } from '@/utils/dictionaries'

type LanguageContextProviderProps = {
  children: ReactNode
  language: Language
  dictionary: Dictionary
}

type LanguageContextType = Pick<
  LanguageContextProviderProps,
  'dictionary' | 'language'
>

export const languageContext = createContext({} as LanguageContextType)

export const LanguageContextProvider = ({
  children,
  language,
  dictionary,
}: LanguageContextProviderProps) => {
  return (
    <languageContext.Provider value={{ language, dictionary }}>
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
