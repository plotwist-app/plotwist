import type { Language } from '@/types/languages'

const INTERNAL_ORIGIN = 'https://plotwist.internal'
const ENCODED_PATH_SEPARATOR = /%(?:25)*(?:2f|5c)/i

function hasControlCharacter(value: string) {
  return Array.from(value).some(character => {
    const code = character.charCodeAt(0)
    return code <= 31 || code === 127
  })
}

export function getSafeLocalizedRedirectPath(
  target: string | string[] | undefined,
  language: Language
) {
  if (
    typeof target !== 'string' ||
    !target.startsWith('/') ||
    target.startsWith('//') ||
    target.includes('\\') ||
    hasControlCharacter(target) ||
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
