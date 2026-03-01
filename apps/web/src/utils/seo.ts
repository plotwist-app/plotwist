import type { Metadata } from 'next'
import { APP_URL } from '../../constants'
import { SUPPORTED_LANGUAGES } from '../../languages'

/**
 * Generates canonical URL + hreflang alternates for any page.
 * Pass the current lang and the path WITHOUT the lang prefix.
 *
 * Example: buildLanguageAlternates('pt-BR', '/movies/popular')
 */
export function buildLanguageAlternates(
  lang: string,
  path: string
): Pick<NonNullable<Metadata['alternates']>, 'canonical' | 'languages'> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return {
    canonical: `${APP_URL}/${lang}${normalizedPath}`,
    languages: SUPPORTED_LANGUAGES.reduce(
      (acc, language) => {
        if (language.enabled) {
          acc[language.hreflang] = `${APP_URL}/${language.value}${normalizedPath}`
        }
        return acc
      },
      {} as Record<string, string>
    ),
  }
}
