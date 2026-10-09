import type { Metadata } from 'next'
import type { Dictionary } from '@/dictionaries'
import { LANGUAGES } from '@/types/languages'
import { APP_URL } from './constants'

export function buildTitle(dictionary: Dictionary) {
  return `${dictionary.together.kicker} — ${dictionary.together.title}`
}

export function buildWelcomeMetadata(
  lang: string,
  dictionary: Dictionary
): Metadata {
  const title = buildTitle(dictionary)

  return {
    title,
    description: dictionary.together.subtitle,
    alternates: {
      canonical: `${APP_URL}/${lang}`,
      languages: Object.fromEntries(
        LANGUAGES.map(language => [language, `${APP_URL}/${language}`])
      ),
    },
    openGraph: {
      title,
      description: dictionary.together.subtitle,
      url: `${APP_URL}/${lang}`,
      siteName: dictionary.together.kicker,
      locale: lang,
      type: 'website',
    },
    robots: { index: true, follow: true },
  }
}

export function buildRoomMetadata(dictionary: Dictionary): Metadata {
  return {
    title: buildTitle(dictionary),
    description: dictionary.together.join_subtitle,
    robots: { index: false, follow: false },
  }
}
