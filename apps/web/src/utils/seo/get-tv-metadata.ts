import { type Language, tmdb } from '@/services/tmdb'
import { tmdbImage } from '@/utils/tmdb/image'
import type { Metadata } from 'next'
import { APP_URL } from '../../../constants'
import { SUPPORTED_LANGUAGES } from '../../../languages'

export async function getTvMetadata(
  id: number,
  lang: Language
): Promise<Metadata> {
  const {
    name,
    overview,
    backdrop_path: backdrop,
  } = await tmdb.tv.details(id, lang)

  const keywords = await tmdb.keywords('tv', id)
  const canonicalUrl = `${APP_URL}/${lang}/tv-series/${id}`

  const languageAlternates = SUPPORTED_LANGUAGES.reduce(
    (acc, lang) => {
      if (lang.enabled) {
        acc[lang.hreflang] = `${APP_URL}/${lang.value}/tv-series/${id}`
      }
      return acc
    },
    {} as Record<string, string>
  )

  return {
    title: `${name} • Plotwist`,
    description: overview,
    keywords: keywords?.map(keyword => keyword.name).join(','),
    openGraph: {
      images: [tmdbImage(backdrop)],
      title: `${name} • Plotwist`,
      description: overview,
      siteName: 'Plotwist',
      type: 'video.tv_show',
    },
    twitter: {
      title: `${name} • Plotwist`,
      description: overview,
      images: tmdbImage(backdrop),
      card: 'summary_large_image',
    },
    alternates: {
      canonical: canonicalUrl,
      languages: languageAlternates,
    },
  }
}
