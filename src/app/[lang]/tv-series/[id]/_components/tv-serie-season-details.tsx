import { Language } from '@/types/languages'
import { TvSerieSeasonDetailsContent } from './tv-serie-season-details-content'
import { tmdb } from '@/services/tmdb'

type TvSerieSeasonDetailsProps = {
  id: number
  seasonNumber: number
  language: Language
}

export const TvSerieSeasonDetails = async ({
  id,
  seasonNumber,
  language,
}: TvSerieSeasonDetailsProps) => {
  const { episodes } = await tmdb.tvSeasons.details(id, seasonNumber, language)

  return <TvSerieSeasonDetailsContent episodes={episodes} />
}
