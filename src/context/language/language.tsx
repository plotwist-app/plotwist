'use client'

import { ReactNode, createContext, useContext } from 'react'
import { Language } from '@/types/languages'
import { Dictionary } from '@/utils/dictionaries'

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
      'LanguageContext must be used within LanguageContextProvider',
    )
  }

  return context
}
