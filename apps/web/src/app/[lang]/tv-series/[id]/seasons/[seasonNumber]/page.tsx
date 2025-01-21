import { tmdb } from '@/services/tmdb'
import type { PageProps } from '@/types/languages'
import { SeasonDetails } from './_components/season-details'
import { SeasonTabs } from './_components/season-tabs'
import { SeasonNavigation } from './_components/season-navigation'

type SeasonPageProps = PageProps<{
  seasonNumber: string
  id: string
}>

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
      <SeasonTabs seasonDetails={currentSeason} language={lang} />
      <SeasonNavigation
        seasonNumber={Number(seasonNumber)}
        id={Number(id)}
        language={lang}
      />
    </div>
  )
}
