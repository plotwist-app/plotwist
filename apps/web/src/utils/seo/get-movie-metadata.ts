import { tmdb } from '@/services/tmdb'

import type { Language } from '@/types/languages'
import type { Metadata } from 'next'
import { tmdbImage } from '../tmdb/image'

import { APP_URL } from '../../../constants'
import { SUPPORTED_LANGUAGES } from '../../../languages'

export async function getMovieMetadata(
  id: number,
  language: Language
): Promise<Metadata> {
  const {
    title,
    overview,
    backdrop_path,
    original_title,
    vote_average,
    release_date,
  } = await tmdb.movies.details(Number(id), language)
  const keywords = await tmdb.keywords('movie', Number(id))

  const canonicalUrl = `${APP_URL}/${language}/movies/${id}`
  const languageAlternates = SUPPORTED_LANGUAGES.reduce(
    (acc, lang) => {
      if (lang.enabled) {
        acc[lang.hreflang] = `${APP_URL}/${lang.value}/movies/${id}`
      }

      return acc
    },
    {} as Record<string, string>
  )

  return {
    title: `${title} • Plotwist`,
    description: overview,
    keywords: [
      keywords?.map(keyword => keyword.name),
      'movie',
      'movies',
      'streaming',
      'trailers',
      'reviews',
      'ratings',
      'where to watch',
      'credits',
      'cast',
      'crew',
      title,
      original_title,
    ].join(','),
    openGraph: {
      images: [tmdbImage(backdrop_path)],
      title: `${title} • Plotwist`,
      description: overview,
      siteName: 'Plotwist',
      locale: language,
      url: canonicalUrl,
      type: 'video.movie',
    },
    twitter: {
      title: `${title} • Plotwist`,
      description: overview,
      images: tmdbImage(backdrop_path),
      card: 'summary_large_image',
    },
    alternates: {
      canonical: canonicalUrl,
      languages: languageAlternates,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    other: {
      'og:rating': vote_average,
      'og:release_date': release_date,
    },
  }
}
