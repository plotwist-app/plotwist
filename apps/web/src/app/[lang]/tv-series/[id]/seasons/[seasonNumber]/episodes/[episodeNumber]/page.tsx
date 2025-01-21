import { tmdb } from '@/services/tmdb'
import type { PageProps } from '@/types/languages'
import { EpisodeDetails } from './_components/episode-details'
import { EpisodeTabs } from './_components/episode-tabs'
import { EpisodeNavigation } from './_components/episode-navigation'

type EpisodePageProps = PageProps<{
  episodeNumber: string
  seasonNumber: string
  id: string
}>

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
