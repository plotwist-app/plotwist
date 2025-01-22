import { ChevronRight } from 'lucide-react'

import { tmdb } from '@/services/tmdb'
import type { Language } from '@/types/languages'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

async function getSeasonDetails(
  tvId: number,
  seasonNumber: number,
  lang: Language
) {
  try {
    const season = await tmdb.season.details(tvId, seasonNumber, lang)

    if (
      season.season_number === 0 ||
      season.episodes.length === 0 ||
      season.air_date === null
    )
      return null

    return season
  } catch (error) {
    return null
  }
}

type SeasonNavigationProps = {
  id: number
  seasonNumber: number
  language: Language
}

export async function SeasonNavigation({
  id,
  seasonNumber,
  language,
}: SeasonNavigationProps) {
  const [previousSeason, nextSeason] = await Promise.all([
    getSeasonDetails(Number(id), Number(seasonNumber) - 1, language),
    getSeasonDetails(Number(id), Number(seasonNumber) + 1, language),
  ])

  return (
    <nav className="justify-between w-full flex items-center gap-2">
      {previousSeason && (
        <Link
          href={`/${language}/tv-series/${id}/seasons/${Number(seasonNumber) - 1}`}
          className="flex items-center gap-1 text-sm"
        >
          <ChevronLeft /> {previousSeason.name}
        </Link>
      )}

      {!previousSeason && <div />}

      {nextSeason && (
        <Link
          href={`/${language}/tv-series/${id}/seasons/${Number(seasonNumber) + 1}`}
          className="flex items-center gap-1 text-sm"
        >
          {nextSeason.name} <ChevronRight className="size-5" />
        </Link>
      )}
    </nav>
  )
}
