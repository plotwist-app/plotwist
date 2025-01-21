import { tmdb } from '@/services/tmdb'
import type { PageProps } from '@/types/languages'
import { EpisodeDetails } from './_components/episode-details'
import { EpisodeTabs } from './_components/episode-tabs'
import { EpisodeNavigation } from './_components/episode-navigation'
import type { Metadata } from 'next'

type EpisodePageProps = PageProps<{
  id: string
  seasonNumber: string
  episodeNumber: string
}>

export async function generateMetadata({
  params,
}: EpisodePageProps): Promise<Metadata> {
  const { lang, id, seasonNumber, episodeNumber } = await params

  const episode = await tmdb.episodes.details(
    Number(id),
    Number(seasonNumber),
    Number(episodeNumber),
    lang
  )
  const tvShow = await tmdb.tv.details(Number(id), lang)

  const title = `${tvShow.name}: ${episode.name}`
  const description =
    episode.overview ||
    `Episode ${episodeNumber} of ${tvShow.name} Season ${seasonNumber}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: tvShow.backdrop_path
        ? [`https://image.tmdb.org/t/p/w500${tvShow.backdrop_path}`]
        : undefined,
      siteName: 'Plotwist',
    },
    twitter: {
      title,
      description,
      images: tvShow.backdrop_path
        ? [`https://image.tmdb.org/t/p/w500${tvShow.backdrop_path}`]
        : undefined,
      card: 'summary_large_image',
    },
  }
}

export default async function EpisodePage({ params }: EpisodePageProps) {
  const { lang, episodeNumber, seasonNumber, id } = await params

  const episode = await tmdb.episodes.details(
    Number(id),
    Number(seasonNumber),
    Number(episodeNumber),
    lang
  )

  return (
    <div className="max-w-3xl mx-auto space-y-6 pt-4 px-4 pb-6 lg:px-0 lg:pt-0">
      <EpisodeDetails
        episode={episode}
        language={lang}
        tvId={Number(id)}
        seasonNumber={Number(seasonNumber)}
      />
      <EpisodeTabs language={lang} />
      <EpisodeNavigation
        tvId={Number(id)}
        seasonNumber={Number(seasonNumber)}
        episodeNumber={Number(episodeNumber)}
        language={lang}
      />
    </div>
  )
}
