import { tmdb } from '@/services/tmdb'
import type { Language, PageProps } from '@/types/languages'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { SeasonDetails } from './_components/season-details'
import { SeasonTabs } from './_components/season-tabs'

type SeasonPageProps = PageProps<{
  seasonNumber: string
  id: string
}>

async function getSeasonDetails(
  tvId: number,
  seasonNumber: number,
  lang: Language
) {
  try {
    return await tmdb.season.details(tvId, seasonNumber, lang)
  } catch (error) {
    return null
  }
}

export default async function SeasonPage({ params }: SeasonPageProps) {
  const { lang, seasonNumber, id } = await params

  const currentSeason = await tmdb.season.details(
    Number(id),
    Number(seasonNumber),
    lang
  )

  const [previousSeason, nextSeason] = await Promise.all([
    getSeasonDetails(Number(id), Number(seasonNumber) - 1, lang),
    getSeasonDetails(Number(id), Number(seasonNumber) + 1, lang),
  ])

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-4">
      <SeasonDetails season={currentSeason} language={lang} />
      <SeasonTabs seasonDetails={currentSeason} language={lang} />

      <nav className="justify-between w-full hidden">
        {previousSeason && (
          <Link
            href={`/tv-series/${id}/seasons/${Number(seasonNumber) - 1}`}
            className="text-primary hover:underline flex items-center gap-1"
          >
            <ChevronLeft /> {previousSeason.name}
          </Link>
        )}
        {!previousSeason && <div />}

        {nextSeason && (
          <Link
            href={`/tv-series/${id}/seasons/${Number(seasonNumber) + 1}`}
            className="text-primary hover:underline flex items-center gap-1"
          >
            {nextSeason.name} <ChevronRight />
          </Link>
        )}
      </nav>
    </div>
  )
}
