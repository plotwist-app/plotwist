import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { languages } from '../../languages'
import type { Language } from '@/types/languages'
import { isLanguage } from '@/types/languages'

const DEFAULT_LOCALE: Language = 'en-US'

function isValidLanguageRange(language: string): boolean {
  if (language === '*') {
    return false
  }

  try {
    Intl.getCanonicalLocales(language)
    return true
  } catch {
    return false
  }
}

export function detectRequestLocale(
  acceptLanguage: string | null
): Language {
  if (!acceptLanguage) {
    return DEFAULT_LOCALE
  }

  const requestedLanguages = new Negotiator({
    headers: { 'accept-language': acceptLanguage },
  })
    .languages()
    .filter(isValidLanguageRange)

  const locale = match(requestedLanguages, languages, DEFAULT_LOCALE)

  return isLanguage(locale) ? locale : DEFAULT_LOCALE
}
