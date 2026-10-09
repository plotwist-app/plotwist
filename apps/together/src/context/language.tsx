'use client'

import { createContext, type ReactNode, useContext } from 'react'
import type { Dictionary } from '@/dictionaries'
import { asLanguage, type Language } from '@/types/languages'

type LanguageContextType = {
  dictionary: Dictionary
  language: Language
}

const languageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({
  children,
  language,
  dictionary,
}: {
  children: ReactNode
  language: string
  dictionary: Dictionary
}) {
  return (
    <languageContext.Provider
      value={{ language: asLanguage(language), dictionary }}
    >
      {children}
    </languageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(languageContext)

  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }

  return context
}
