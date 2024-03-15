import { PageProps } from '@/types/languages'
import { TvSerieDetails } from './_components/tv-serie-details'
import { Metadata } from 'next'
import { tmdb } from '@/services/tmdb'
import { tmdbImage } from '@/utils/tmdb/image'
import { getTvSeriesPagesIds } from '@/utils/seo/get-tv-series-pages-ids'

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
  params,
}: TvSeriePageProps): Promise<Metadata> {
  const {
    name,
    overview,
    backdrop_path: backdrop,
  } = await tmdb.tvSeries.details(Number(params.id), params.lang)

  const keywords = await tmdb.keywords({
    id: Number(params.id),
    type: 'tv',
  })

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
  }
}

const TvSeriePage = ({ params }: TvSeriePageProps) => {
  return <TvSerieDetails id={Number(params.id)} language={params.lang} />
}

export default TvSeriePage
