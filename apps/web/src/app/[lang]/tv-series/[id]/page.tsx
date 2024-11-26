import { tmdb } from '@/services/tmdb'
import type { PageProps } from '@/types/languages'
import { getTvSeriesIds } from '@/utils/seo/get-tv-series-ids'
import { tmdbImage } from '@/utils/tmdb/image'
import type { Metadata } from 'next'
import { APP_URL } from '../../../../../constants'
import { SUPPORTED_LANGUAGES } from '../../../../../languages'
import { TvSerieDetails } from './_components/tv-serie-details'

export type TvSeriePageProps = PageProps & {
  params: { id: string }
}

export async function generateStaticParams() {
  const tvSeriesIds = await getTvSeriesIds(1)

  return tvSeriesIds.map(id => ({ id: String(id) }))
}

export async function generateMetadata(props: TvSeriePageProps): Promise<Metadata> {
  const params = await props.params;

  const {
    id,
    lang
  } = params;

  const {
    name,
    overview,
    backdrop_path: backdrop,
  } = await tmdb.tv.details(Number(id), lang)

  const keywords = await tmdb.keywords('tv', Number(id))

  const canonicalUrl = `${APP_URL}/${lang}/tv-series/${id}`
  const languageAlternates = SUPPORTED_LANGUAGES.reduce(
    (acc, lang) => {
      if (lang.enabled) {
        acc[lang.hreflang] = `${APP_URL}/${lang.value}`
      }
      return acc
    },
    {} as Record<string, string>
  )

  return {
    title: name,
    description: overview,
    keywords: keywords?.map(keyword => keyword.name).join(','),
    openGraph: {
      images: [tmdbImage(backdrop)],
      title: name,
      description: overview,
      siteName: 'Plotwist',
    },
    twitter: {
      title: name,
      description: overview,
      images: tmdbImage(backdrop),
      card: 'summary_large_image',
      creator: '@lui7henrique',
    },
    alternates: {
      canonical: canonicalUrl,
      languages: languageAlternates,
    },
  }
}

const TvSeriePage = async (props: TvSeriePageProps) => {
  const params = await props.params;
  return <TvSerieDetails id={Number(params.id)} language={params.lang} />
}

export default TvSeriePage
