import { Language } from '@/types/languages'
import { TvShowSeasonDetailsContent } from './tv-show-season-details-content'
import { tmdb } from '@/services/tmdb2'

type TvShowSeasonDetailsProps = {
  id: number
  seasonNumber: number
  language: Language
}

export const TvShowSeasonDetails = async ({
  id,
  seasonNumber,
  language,
}: TvShowSeasonDetailsProps) => {
  const { episodes } = await tmdb.tvSeasons.details(id, seasonNumber, language)

  return <TvShowSeasonDetailsContent episodes={episodes} />
}
