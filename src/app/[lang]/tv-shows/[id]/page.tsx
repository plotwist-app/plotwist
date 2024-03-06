import { Language } from '@/types/languages'
import { TvShowsDetails } from './_components/tv-show-details'
import { Metadata } from 'next'
import { tmdb } from '@/services/tmdb'
import { tmdbImage } from '@/utils/tmdb/image'

export type TvShowPageProps = { params: { id: string; lang: Language } }

export async function generateMetadata({
  params,
}: TvShowPageProps): Promise<Metadata> {
  const tvShow = await tmdb.tvSeries.details(Number(params.id), params.lang)

  const keywords = await tmdb.keywords({
    id: Number(params.id),
    type: 'tv',
  })

  return {
    title: tvShow.name,
    description: tvShow.overview,
    keywords: keywords?.map((keyword) => keyword.name).join(','),
    openGraph: {
      images: [tmdbImage(tvShow.backdrop_path)],
      title: tvShow.name,
      description: tvShow.overview,
    },
    twitter: {
      title: tvShow.name,
      description: tvShow.overview,
      images: tmdbImage(tvShow.backdrop_path),
      card: 'summary_large_image',
      creator: '@lui7henrique',
    },
  }
}

const TvShowPage = ({ params }: TvShowPageProps) => {
  return <TvShowsDetails id={Number(params.id)} language={params.lang} />
}

export default TvShowPage
