export type Language =
  | 'en-US'
  | 'es-ES'
  | 'fr-FR'
  | 'de-DE'
  | 'it-IT'
  | 'pt-BR'
  | 'ja-JP'

const LANGUAGES: readonly Language[] = [
  'en-US',
  'es-ES',
  'fr-FR',
  'de-DE',
  'it-IT',
  'pt-BR',
  'ja-JP',
] as const

export function isLanguage(lang: string): lang is Language {
  return LANGUAGES.includes(lang as Language)
}

export function asLanguage(lang: string): Language {
  return isLanguage(lang) ? lang : 'en-US'
}

/**
 * Helper to extract and validate lang from params.
 * Next.js 16 types params.lang as string, this ensures type safety.
 */
export async function getLanguageFromParams<T extends { lang: string }>(
  params: Promise<T>
): Promise<{ lang: Language } & Omit<T, 'lang'>> {
  const resolved = await params
  return {
    ...resolved,
    lang: asLanguage(resolved.lang),
  }
}

export type PageProps<T = unknown> = {
  params: Promise<
    {
      lang: string
    } & T
  >
}
