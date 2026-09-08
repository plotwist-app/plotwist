import type { Language } from '@/types/languages'

const INTERNAL_ORIGIN = 'https://plotwist.internal'
const ENCODED_PATH_SEPARATOR = /%(?:25)*(?:2f|5c)/i
const CONTROL_CHARACTER = /[\u0000-\u001f\u007f]/

export function getSafeLocalizedRedirectPath(
  target: string | string[] | undefined,
  language: Language
) {
  if (
    typeof target !== 'string' ||
    !target.startsWith('/') ||
    target.startsWith('//') ||
    target.includes('\\') ||
    CONTROL_CHARACTER.test(target) ||
    ENCODED_PATH_SEPARATOR.test(target)
  ) {
    return null
  }

  let parsed: URL
  try {
    parsed = new URL(target, INTERNAL_ORIGIN)
  } catch {
    return null
  }

  const localeRoot = `/${language}`
  const isCurrentLocale =
    parsed.pathname === localeRoot ||
    parsed.pathname.startsWith(`${localeRoot}/`)

  if (parsed.origin !== INTERNAL_ORIGIN || !isCurrentLocale) {
    return null
  }

  return target
}
