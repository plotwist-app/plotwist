import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import type { Language } from '@/types/languages'
import { isLanguage } from '@/types/languages'
import { languages } from '../../languages'

const DEFAULT_LOCALE: Language = 'en-US'
const QUALITY_PARAMETER =
  /^\s*q=(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)\s*$/i

function hasValidQualityParameter(languageEntry: string): boolean {
  const [, ...parameters] = languageEntry.split(';')

  return parameters.length === 0
    ? true
    : parameters.length === 1 && QUALITY_PARAMETER.test(parameters[0])
}

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

export function detectRequestLocale(acceptLanguage: string | null): Language {
  if (!acceptLanguage) {
    return DEFAULT_LOCALE
  }

  const sanitizedAcceptLanguage = acceptLanguage
    .split(',')
    .filter(hasValidQualityParameter)
    .join(',')

  const requestedLanguages = new Negotiator({
    headers: { 'accept-language': sanitizedAcceptLanguage },
  })
    .languages()
    .filter(isValidLanguageRange)

  const locale = match(requestedLanguages, languages, DEFAULT_LOCALE)

  return isLanguage(locale) ? locale : DEFAULT_LOCALE
}
