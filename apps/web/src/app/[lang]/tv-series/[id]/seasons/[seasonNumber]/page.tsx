import { tmdb } from '@/services/tmdb'
import type { PageProps } from '@/types/languages'
import { SeasonDetails } from './_components/season-details'
import { SeasonTabs } from './_components/season-tabs'
import { SeasonNavigation } from './_components/season-navigation'
import type { Metadata } from 'next'

type SeasonPageProps = PageProps<{
  seasonNumber: string
  id: string
}>

export async function generateMetadata({
  params,
}: SeasonPageProps): Promise<Metadata> {
  const { lang, seasonNumber, id } = await params

  const season = await tmdb.season.details(
    Number(id),
    Number(seasonNumber),
    lang
  )
  const tvShow = await tmdb.tv.details(Number(id), lang)

  return {
    title: `${tvShow.name}: ${season.name}`,
    description: season.overview || `${season.name} of ${tvShow.name}`,
    openGraph: {
      title: `${tvShow.name}: ${season.name}`,
      description: season.overview || `${season.name} of ${tvShow.name}`,
      images: tvShow.backdrop_path
        ? [`https://image.tmdb.org/t/p/w500${tvShow.backdrop_path}`]
        : undefined,
      siteName: 'Plotwist',
    },
    twitter: {
      title: `${tvShow.name}: ${season.name}`,
      description: season.overview || `${season.name} of ${tvShow.name}`,
      images: tvShow.backdrop_path
        ? [`https://image.tmdb.org/t/p/w500${tvShow.backdrop_path}`]
        : undefined,
      card: 'summary_large_image',
    },
  }
}

export default async function SeasonPage({ params }: SeasonPageProps) {
  const { lang, seasonNumber, id } = await params

  const currentSeason = await tmdb.season.details(
    Number(id),
    Number(seasonNumber),
    lang
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-4 px-4 pb-6 lg:px-0 lg:pt-0">
      <SeasonDetails season={currentSeason} language={lang} id={Number(id)} />
      <SeasonTabs
        seasonDetails={currentSeason}
        language={lang}
        id={Number(id)}
      />
      <SeasonNavigation
        seasonNumber={Number(seasonNumber)}
        id={Number(id)}
        language={lang}
      />
    </div>
  )
}
