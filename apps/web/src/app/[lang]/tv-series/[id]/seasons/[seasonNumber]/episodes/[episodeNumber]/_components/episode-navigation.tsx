import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'next-view-transitions'
import { tmdb } from '@/services/tmdb'
import type { Language } from '@/types/languages'
import { getDictionary } from '@/utils/dictionaries'

async function getEpisodeDetails(
  tvId: number,
  seasonNumber: number,
  episodeNumber: number,
  lang: Language
) {
  try {
    const episode = await tmdb.episodes.details(
      tvId,
      seasonNumber,
      episodeNumber,
      lang
    )
    return episode
  } catch (error) {
    return null
  }
}

type EpisodeNavigationProps = {
  tvId: number
  seasonNumber: number
  episodeNumber: number
  language: Language
}

export async function EpisodeNavigation({
  tvId,
  seasonNumber,
  episodeNumber,
  language,
}: EpisodeNavigationProps) {
  const dictionary = await getDictionary(language)
  const [previousEpisode, nextEpisode] = await Promise.all([
    getEpisodeDetails(tvId, seasonNumber, episodeNumber - 1, language),
    getEpisodeDetails(tvId, seasonNumber, episodeNumber + 1, language),
  ])

  return (
    <nav className="justify-between w-full flex items-center gap-2">
      {previousEpisode && (
        <Link
          href={`/${language}/tv-series/${tvId}/seasons/${seasonNumber}/episodes/${episodeNumber - 1}`}
          className="flex items-center gap-1 text-sm"
        >
          <ChevronLeft /> {dictionary.previous_episode}
        </Link>
      )}

      {!previousEpisode && <div />}

      {nextEpisode && (
        <Link
          href={`/${language}/tv-series/${tvId}/seasons/${seasonNumber}/episodes/${episodeNumber + 1}`}
          className="flex items-center gap-1 text-sm"
        >
          {dictionary.next_episode} <ChevronRight className="size-5" />
        </Link>
      )}
    </nav>
  )
}
