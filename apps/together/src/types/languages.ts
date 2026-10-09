export type Language =
  | 'en-US'
  | 'es-ES'
  | 'fr-FR'
  | 'de-DE'
  | 'it-IT'
  | 'pt-BR'
  | 'ja-JP'

export const LANGUAGES: readonly Language[] = [
  'en-US',
  'es-ES',
  'fr-FR',
  'de-DE',
  'it-IT',
  'pt-BR',
  'ja-JP',
] as const

export const DEFAULT_LANGUAGE: Language = 'en-US'

export function isLanguage(lang: string): lang is Language {
  return LANGUAGES.includes(lang as Language)
}

export function asLanguage(lang: string): Language {
  return isLanguage(lang) ? lang : DEFAULT_LANGUAGE
}

export type PageProps<T = unknown> = {
  params: Promise<
    {
      lang: string
    } & T
  >
}
