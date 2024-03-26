import { tmdb } from '@plotwist/tmdb'

import { Language } from '@/types/languages'
import { TvSerieSeasonDetailsContent } from './tv-serie-season-details-content'

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
  const { episodes } = await tmdb.season.details(id, seasonNumber, language)

  return <TvSerieSeasonDetailsContent episodes={episodes} />
}
