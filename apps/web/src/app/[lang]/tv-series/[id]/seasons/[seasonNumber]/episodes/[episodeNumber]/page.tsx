import { tmdb } from '@/services/tmdb'
import type { PageProps } from '@/types/languages'
import { tmdbImage } from '@/utils/tmdb/image'
import type { Metadata } from 'next'
import { EpisodeDetails } from './_components/episode-details'
import { EpisodeNavigation } from './_components/episode-navigation'
import { EpisodeTabs } from './_components/episode-tabs'

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
      images: episode.still_path
        ? [tmdbImage(episode.still_path, 'w500')]
        : undefined,
      siteName: 'Plotwist',
    },
    twitter: {
      title,
      description,
      images: episode.still_path
        ? [tmdbImage(episode.still_path, 'w500')]
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

      <EpisodeTabs
        language={lang}
        id={Number(id)}
        seasonNumber={Number(seasonNumber)}
        episodeNumber={Number(episodeNumber)}
      />

      <EpisodeNavigation
        tvId={Number(id)}
        seasonNumber={Number(seasonNumber)}
        episodeNumber={Number(episodeNumber)}
        language={lang}
      />
    </div>
  )
}
