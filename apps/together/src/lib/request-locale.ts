import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import {
  DEFAULT_LANGUAGE,
  isLanguage,
  LANGUAGES,
  type Language,
} from '@/types/languages'

const QUALITY_PARAMETER = /^\s*q=(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)\s*$/i

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
    return DEFAULT_LANGUAGE
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

  const locale = match(requestedLanguages, [...LANGUAGES], DEFAULT_LANGUAGE)

  return isLanguage(locale) ? locale : DEFAULT_LANGUAGE
}
