import { PageProps } from '@/types/languages'
import { TvSerieDetails } from './_components/tv-serie-details'
import { Metadata } from 'next'
import { tmdbImage } from '@/utils/tmdb/image'
import { getTvSeriesIds } from '@/utils/seo/get-tv-series-ids'
import { APP_URL } from '../../../../../constants'
import { SUPPORTED_LANGUAGES } from '../../../../../languages'
import { tmdb } from '@plotwist/tmdb'

export type TvSeriePageProps = PageProps & {
  params: { id: string }
}

export const dynamic = 'force-static'
export async function generateStaticParams() {
  const tvSeriesIds = await getTvSeriesIds(1)

  return tvSeriesIds.map((id) => ({ id: String(id) }))
}

export async function generateMetadata({
  params: { id, lang },
}: TvSeriePageProps): Promise<Metadata> {
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
    {} as Record<string, string>,
  )

  return {
    title: name,
    description: overview,
    keywords: keywords?.map((keyword) => keyword.name).join(','),
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

const TvSeriePage = ({ params }: TvSeriePageProps) => {
  return <TvSerieDetails id={Number(params.id)} language={params.lang} />
}

export default TvSeriePage
