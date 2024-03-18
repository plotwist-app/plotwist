import { Language, PageProps } from '@/types/languages'
import { TvSerieDetails } from './_components/tv-serie-details'
import { Metadata } from 'next'
import { tmdb } from '@/services/tmdb'
import { tmdbImage } from '@/utils/tmdb/image'
import { getTvSeriesPagesIds } from '@/utils/seo/get-tv-series-pages-ids'
import { APP_URL } from '../../../../../constants'
import { SUPPORTED_LANGUAGES } from '../../../../../languages'

export type TvSeriePageProps = PageProps & {
  params: { id: string }
}

export async function generateStaticParams({
  params: { lang },
}: TvSeriePageProps) {
  const tvSeriesIds = await getTvSeriesPagesIds(lang)

  return tvSeriesIds.map((id) => ({ id }))
}

export async function generateMetadata({
  params: { id, lang },
}: TvSeriePageProps): Promise<Metadata> {
  const {
    name,
    overview,
    backdrop_path: backdrop,
  } = await tmdb.tvSeries.details(Number(id), lang)

  const keywords = await tmdb.keywords({
    id: Number(id),
    type: 'tv',
  })

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
